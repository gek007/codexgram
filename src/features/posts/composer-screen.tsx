import React, { useEffect, useRef, useState } from "react";
import { Text, View, Image, Pressable, Alert } from "react-native";
import { useAuth } from "@clerk/expo";
import { router } from "expo-router";
import { randomUUID } from "expo-crypto";
import { useMutation, useQuery, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useSession } from "@/providers/session";
import { useTheme } from "@/theme/theme-provider";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { StateView } from "@/components/ui/state-view";
import { errorMessage } from "@/lib/errors";
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
  const create = useMutation(api.posts.create);
  const update = useMutation(api.posts.update);
  const post = useQuery(api.posts.get, postId ? { postId } : "skip");
  const joined = usePaginatedQuery(
    api.communities.joined,
    {},
    { initialNumItems: 20 },
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);
  const finished = useRef(false);
  const hydrated = useRef(false);
  useEffect(() => {
    if (!user || hydrated.current || (postId && post === undefined)) return;
    hydrated.current = true;
    void loadDraft(user.id)
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
        upload: async (d) =>
          uploadPhoto({
            uri: d.localPhotoUri!,
            purpose: "post",
            requestId: d.requestId,
            getToken: () => getToken({ template: "convex" }),
          }),
        save: async (d) => {
          await saveDraft(d);
          setDraft(d);
        },
        create: async (d) => {
          if (postId && post) {
            await update({
              postId,
              caption: d.caption,
              assetId: d.uploadedAssetId as Id<"mediaAssets"> | undefined,
              expectedRevision: post.revision,
            });
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
          await clearDraft(draft.ownerId);
        },
      });
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
      <Screen>
        <StateView
          title="Photo unavailable"
          detail="This post was removed or you cannot view it."
        />
      </Screen>
    );
  if (!draft)
    return (
      <Screen>
        <StateView title="Opening your draft…" loading />
      </Screen>
    );
  if (editing)
    return (
      <Screen title="Make it yours">
        <PhotoEditor
          photo={editing}
          onCancel={() => setEditing(null)}
          onDone={(p) => {
            const id = randomUUID();
            void retainPhoto(draft.ownerId, p.uri, id)
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
  return (
    <Screen
      title={postId ? "A fresh perspective" : "Share a little something"}
      subtitle={
        postId
          ? "Your likes and comments stay with this post."
          : "A moment worth sharing with your community."
      }
    >
      {draft.localPhotoUri || post?.photoUrl ? (
        <Image
          accessibilityLabel="Your photo preview"
          source={{ uri: draft.localPhotoUri ?? post?.photoUrl }}
          style={{ width: "100%", aspectRatio: 1, borderRadius: 24 }}
        />
      ) : (
        <View
          style={{
            height: 190,
            backgroundColor: colors.secondary,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 44 }}>✳</Text>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>
            Every perspective belongs.
          </Text>
        </View>
      )}
      <View style={{ gap: 10 }}>
        <Button
          secondary
          label="Take a photo"
          disabled={busy}
          onPress={() => void choose(true)}
        />
        <Button
          secondary
          label="Choose from library"
          disabled={busy}
          onPress={() => void choose(false)}
        />
      </View>
      <Field
        label="Caption"
        placeholder="What’s the story?"
        value={draft.caption}
        maxLength={2000}
        multiline
        editable={!busy}
        onChangeText={(caption) => patch({ caption })}
      />
      {!postId && (
        <>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
            Share with
          </Text>
          <View style={{ gap: 8 }}>
            {joined.results.map((c) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: draft.communityId === c.id }}
                disabled={busy}
                key={c.id}
                onPress={() => patch({ communityId: c.id })}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor:
                    draft.communityId === c.id ? colors.primary : colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  {c.name}
                  {draft.communityId === c.id ? "  ✓" : ""}
                </Text>
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
        </>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <Button
        label={postId ? "Save changes" : "Publish photo"}
        loading={busy}
        onPress={() => void publish()}
      />
      <Button
        secondary
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
                  void clearDraft(draft.ownerId).then(() => router.back());
                },
              },
            ],
          )
        }
      />
      <Text style={{ color: colors.muted, fontSize: 13 }}>
        Drafts stay on this device. Up to 10 new posts each day.
      </Text>
    </Screen>
  );
}
