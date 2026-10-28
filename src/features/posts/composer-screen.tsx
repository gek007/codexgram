import React, { useEffect, useRef, useState } from "react";
import { Text, View, Image, Pressable, Alert } from "react-native";
import { useAuth } from "@clerk/expo";
import { router, usePreventRemove } from "expo-router";
import { randomUUID } from "expo-crypto";
import {
  useMutation,
  useQuery,
  usePaginatedQuery,
  useConvex,
} from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useSession } from "@/providers/session";
import { useTheme } from "@/theme/theme-provider";
import { Feather } from "@expo/vector-icons";
import { PhotoSourceSheet } from "@/components/ui/photo-source-sheet";
import { CommunityArt } from "@/components/ui/community-art";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { StateView } from "@/components/ui/state-view";
import { errorMessage } from "@/lib/errors";
import { ComposerHeader } from "./composer-navigation";
import { PhotoEditor } from "./photo-editor";
import { selectPhoto, type Photo } from "./media";
import {
  loadDraft,
  saveDraft,
  clearDraft,
  retainPhoto,
  type Draft,
} from "./draft-store";
import { uploadPhoto } from "./upload";
import { publishDraft } from "./publish-flow";
import { makeEditInput } from "./edit-input";
export function ComposerScreen({
  communityId,
  postId,
}: {
  communityId?: Id<"communities">;
  postId?: Id<"posts">;
}) {
  const { user } = useSession();
  const { colors } = useTheme();
  const { getToken } = useAuth();
  const convex = useConvex();
  const create = useMutation(api.posts.create);
  const update = useMutation(api.posts.update);
  const post = useQuery(api.posts.get, postId ? { postId } : "skip");
  const joined = usePaginatedQuery(
    api.communities.joined,
    {},
    { initialNumItems: 20 },
  );
  const [sources, setSources] = useState(false);
  const [choosingCommunity, setChoosingCommunity] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const disableRemoval = usePreventRemove(busy);
  const locked = useRef(false);
  const finished = useRef(false);
  const hydrated = useRef(false);
  useEffect(() => {
    if (!user || hydrated.current || (postId && post === undefined)) return;
    hydrated.current = true;
    void loadDraft(user.id, postId)
      .then((saved) => {
        if (saved && saved.postId === postId) {
          setDraft(saved);
          return;
        }
        setDraft({
          version: 1,
          ownerId: user.id,
          requestId: randomUUID(),
          communityId: post?.communityId ?? communityId,
          postId,
          expectedRevision: post?.revision,
          caption: post?.caption ?? "",
          updatedAt: Date.now(),
        });
      })
      .catch(() =>
        setError("Could not restore your draft. Please reopen this screen."),
      );
  }, [user, post, postId, communityId]);
  useEffect(() => {
    if (draft && !finished.current)
      void saveDraft(draft).catch(() =>
        setError(
          "Could not save this draft on your device. Keep this screen open and try again.",
        ),
      );
  }, [draft]);
  const patch = (value: Partial<Draft>) =>
    setDraft((d) => (d ? { ...d, ...value, updatedAt: Date.now() } : d));
  const choose = async (camera: boolean) => {
    setError("");
    try {
      const photo = await selectPhoto(camera);
      if (photo) setEditing(photo);
    } catch (e) {
      setError(
        e instanceof Error && e.message === "CAMERA_DENIED"
          ? "Camera access is off. Enable it in device settings, or choose from your library."
          : "Could not open that photo. Try again.",
      );
    }
  };
  const publish = async () => {
    if (!draft || locked.current) return;
    if (!draft.communityId || (!draft.localPhotoUri && !postId)) {
      setError("Choose a community and a photo first.");
      return;
    }
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const id = await publishDraft(draft, {
        reconcile: async (d) => {
          const found = await convex.query(api.posts.reconcile, {
            requestId: d.requestId,
            postId: d.postId as Id<"posts"> | undefined,
            communityId: d.communityId as Id<"communities"> | undefined,
            caption: d.caption,
            assetId: d.uploadedAssetId as Id<"mediaAssets"> | undefined,
            expectedRevision: d.expectedRevision,
          });
          return found?.postId ?? null;
        },
        assetAvailable: async (assetId) =>
          convex.query(api.media.available, {
            assetId: assetId as Id<"mediaAssets">,
          }),
        upload: async (d) =>
          uploadPhoto({
            uri: d.localPhotoUri!,
            purpose: "post",
            requestId: `${d.requestId}_${d.uploadAttempt ?? 0}`,
            getToken: () => getToken({ template: "convex" }),
          }),
        save: async (d) => {
          await saveDraft(d);
          setDraft(d);
        },
        create: async (d) => {
          if (postId && post) {
            await update(makeEditInput(d));
            return postId;
          }
          return create({
            communityId: d.communityId as Id<"communities">,
            caption: d.caption,
            assetId: d.uploadedAssetId as Id<"mediaAssets">,
            requestId: d.requestId,
          });
        },
        clear: async () => {
          finished.current = true;
          await clearDraft(draft.ownerId, draft.postId);
        },
      });
      disableRemoval();
      router.replace({ pathname: "/post/[postId]", params: { postId: id } });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  if (postId && post === null)
    return (
      <Screen insetTop={false}>
        <StateView
          title="Photo unavailable"
          detail="This post was removed or you cannot view it."
        />
      </Screen>
    );
  if (!draft)
    return (
      <Screen insetTop={false}>
        <StateView title="Opening your draft…" loading />
      </Screen>
    );
  if (editing)
    return (
      <Screen insetTop={false}>
        <PhotoEditor
          photo={editing}
          onCancel={() => setEditing(null)}
          onDone={(p) => {
            const id = randomUUID();
            void retainPhoto(draft.ownerId, p.uri, id, draft.postId)
              .then((uri) => {
                patch({
                  localPhotoUri: uri,
                  width: p.width,
                  height: p.height,
                  requestId: id,
                  uploadedAssetId: undefined,
                });
                setEditing(null);
              })
              .catch(() =>
                setError("Could not retain this photo. Please try again."),
              );
          }}
        />
        {!!error && (
          <Text accessibilityRole="alert" style={{ color: colors.danger }}>
            {error}
          </Text>
        )}
      </Screen>
    );
  const hasPhoto = !!(draft.localPhotoUri || post?.photoUrl);
  const selected = joined.results.find((c) => c.id === draft.communityId);
  return (
    <Screen
      insetTop={false}
      title={postId || hasPhoto ? undefined : "Where are you sharing?"}
      subtitle={
        !postId && !hasPhoto ? "Choose a community for this photo." : undefined
      }
    >
      <ComposerHeader busy={busy} />
      {hasPhoto && (
        <Image
          accessibilityLabel="Your photo preview"
          source={{ uri: draft.localPhotoUri ?? post?.photoUrl }}
          style={{
            width: postId ? "100%" : "78%",
            alignSelf: "center",
            aspectRatio: 1,
            borderRadius: 12,
          }}
        />
      )}
      {!postId && (
        <>
          {hasPhoto && !choosingCommunity && draft.communityId ? (
            <Button
              secondary
              label={`${selected?.name ?? "Selected community"} ▾`}
              disabled={busy}
              onPress={() => setChoosingCommunity(true)}
            />
          ) : (
            <View style={{ gap: 10 }}>
              {joined.results.map((c) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityLabel={c.name}
                  accessibilityState={{ selected: draft.communityId === c.id }}
                  disabled={busy}
                  key={c.id}
                  onPress={() => {
                    patch({ communityId: c.id });
                    setChoosingCommunity(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    padding: 10,
                    borderRadius: 16,
                    backgroundColor:
                      draft.communityId === c.id
                        ? colors.secondary
                        : colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <CommunityArt
                    accent={c.accent}
                    style={{ width: 64, height: 64 }}
                  />
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 17,
                        fontWeight: "700",
                      }}
                    >
                      {c.name}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={{
                        color: colors.muted,
                        fontSize: 14,
                        lineHeight: 20,
                      }}
                    >
                      {c.description}
                    </Text>
                  </View>
                  <Feather
                    name={
                      draft.communityId === c.id ? "check-circle" : "circle"
                    }
                    color={colors.primary}
                    size={24}
                  />
                </Pressable>
              ))}
              {joined.status === "CanLoadMore" && (
                <Button
                  secondary
                  label="More joined communities"
                  onPress={() => joined.loadMore(20)}
                />
              )}
              {joined.results.length === 0 && (
                <Button
                  secondary
                  label="Find a community to join"
                  onPress={() => router.push("/(tabs)/discover")}
                />
              )}
            </View>
          )}
        </>
      )}
      {hasPhoto && (
        <>
          <Field
            label="Caption"
            placeholder="Write a caption…"
            value={draft.caption}
            maxLength={2000}
            multiline
            editable={!busy}
            onChangeText={(caption) => patch({ caption })}
          />
          <Text
            style={{ color: colors.muted, fontSize: 12, alignSelf: "flex-end" }}
          >
            {draft.caption.length.toLocaleString()} / 2,000
          </Text>
        </>
      )}
      <Button
        variant="soft"
        icon={<Feather name="image" size={20} color={colors.text} />}
        label={
          hasPhoto ? (postId ? "Replace photo" : "Change photo") : "Add a photo"
        }
        disabled={busy || (!postId && !draft.communityId)}
        onPress={() => setSources(true)}
      />
      {!!error && (
        <View
          accessibilityRole="alert"
          style={{
            padding: 16,
            borderWidth: 1,
            borderColor: colors.danger,
            borderRadius: 16,
            gap: 8,
          }}
        >
          <Text
            style={{ color: colors.danger, fontWeight: "700", fontSize: 16 }}
          >
            Couldn’t publish your photo.
          </Text>
          <Text style={{ color: colors.text, lineHeight: 22 }}>{error}</Text>
          <Text style={{ color: colors.muted, lineHeight: 22 }}>
            Your draft is saved. Check your connection and try again.
          </Text>
        </View>
      )}
      {hasPhoto && (
        <Button
          label={
            busy
              ? "Publishing your photo…"
              : postId
                ? "Save changes"
                : error
                  ? "Retry upload"
                  : "Publish photo"
          }
          loading={busy}
          onPress={() => void publish()}
        />
      )}
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Feather
          name={postId ? "info" : "smartphone"}
          color={colors.muted}
          size={20}
        />
        <Text
          style={{ flex: 1, color: colors.muted, fontSize: 13, lineHeight: 20 }}
        >
          {postId
            ? "Likes and comments stay with this post."
            : "Your draft is saved on this device."}
        </Text>
      </View>
      {hasPhoto && (
        <Button
          variant="secondary"
          label="Keep draft"
          disabled={busy}
          onPress={() => router.back()}
        />
      )}
      <Button
        variant="tertiary"
        danger
        label="Discard draft"
        disabled={busy}
        onPress={() =>
          Alert.alert(
            "Discard this draft?",
            "The saved photo and caption will be removed from this device.",
            [
              { text: "Keep editing", style: "cancel" },
              {
                text: "Discard",
                style: "destructive",
                onPress: () => {
                  finished.current = true;
                  void clearDraft(draft.ownerId, draft.postId).then(() =>
                    router.back(),
                  );
                },
              },
            ],
          )
        }
      />
      {sources && (
        <PhotoSourceSheet
          onClose={() => setSources(false)}
          onSelect={(camera) => void choose(camera)}
        />
      )}
    </Screen>
  );
}
