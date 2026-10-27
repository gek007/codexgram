import React, { useState } from "react";
import { Text, View, Alert } from "react-native";
import { Image } from "expo-image";
import { Sheet } from "@/components/ui/sheet";

import { router } from "expo-router";
import { randomUUID } from "expo-crypto";
import { useAuth } from "@clerk/expo";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSession } from "@/providers/session";
import { useTheme } from "@/theme/theme-provider";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { errorMessage } from "@/lib/errors";
import { PhotoEditor } from "@/features/posts/photo-editor";
import { selectPhoto, type Photo } from "@/features/posts/media";
import { uploadPhoto } from "@/features/posts/upload";
import { clearAllDrafts } from "@/features/posts/draft-store";
export function AccountSettingsScreen({
  editing = false,
}: {
  editing?: boolean;
}) {
  const { user } = useSession();
  const { colors } = useTheme();
  const { signOut, getToken } = useAuth();
  const profile = useQuery(
    api.users.profile,
    user ? { userId: user.id } : "skip",
  );
  const update = useMutation(api.users.updateProfile);
  const deletion = useMutation(api.accounts.requestDeletion);
  const [sources, setSources] = useState(false);
  const [bio, setBio] = useState(user?.bio ?? "");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [prepared, setPrepared] = useState<Photo | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    if (user) await clearAllDrafts(user.id);
    await signOut();
    router.replace("/");
  };
  if (!user) return null;
  if (photo)
    return (
      <Screen insetTop={false} title="Your profile photo">
        <PhotoEditor
          photo={photo}
          onCancel={() => setPhoto(null)}
          onDone={(p) => {
            setPrepared(p);
            setPhoto(null);
          }}
        />
      </Screen>
    );
  return (
    <Screen
      insetTop={false}
      title={editing ? "Edit profile" : "Settings"}
      subtitle={editing ? `@${user.username}` : undefined}
    >
      {editing ? (
        <>
          <View style={{ alignItems: "center", gap: 12 }}>
            {prepared || profile?.avatarUrl ? (
              <Image
                source={prepared?.uri ?? profile?.avatarUrl}
                style={{ width: 112, height: 112, borderRadius: 56 }}
              />
            ) : (
              <View
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 56,
                  backgroundColor: colors.secondary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 40, color: colors.primary }}>
                  {user.username?.[0]?.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Field
            label="Bio"
            value={bio}
            maxLength={160}
            multiline
            onChangeText={setBio}
          />
          <Button
            secondary
            label={
              prepared ? "Choose another profile photo" : "Choose profile photo"
            }
            disabled={busy}
            onPress={() => setSources(true)}
          />
          {prepared && (
            <Text style={{ color: colors.muted }}>
              A new profile photo is ready. Save to upload it.
            </Text>
          )}
          <Button
            label="Save profile"
            loading={busy}
            onPress={() =>
              void act(async () => {
                const assetId = prepared
                  ? await uploadPhoto({
                      uri: prepared.uri,
                      purpose: "avatar",
                      requestId: randomUUID(),
                      getToken: () => getToken({ template: "convex" }),
                    })
                  : undefined;
                await update({ bio, avatarAssetId: assetId });
                setPrepared(null);
                setMessage("Profile saved.");
              })
            }
          />
          {!!error && (
            <Text accessibilityRole="alert" style={{ color: colors.danger }}>
              {error}
            </Text>
          )}
          {!!message && (
            <Text accessibilityRole="status" style={{ color: colors.teal }}>
              {message}
            </Text>
          )}
        </>
      ) : (
        <>
          <Text
            style={{ fontSize: 14, fontWeight: "600", color: colors.muted }}
          >
            Account
          </Text>
          <Button
            secondary
            label="Edit profile"
            onPress={() => router.push("/settings/profile")}
          />
          <View
            style={{
              padding: 16,
              gap: 6,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              backgroundColor: colors.surface,
            }}
          >
            <Text
              style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}
            >
              Appearance
            </Text>
            <Text style={{ color: colors.muted, lineHeight: 22 }}>
              Light and dark appearance follow your device settings.
            </Text>
          </View>
          <Button
            secondary
            label="Activity"
            onPress={() => router.push("/(tabs)/notifications")}
          />
        </>
      )}
      {!editing && (
        <>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <Button
            secondary
            label="Blocked accounts"
            onPress={() => router.push("/settings/blocked")}
          />
          {user.isAdmin && (
            <Button
              secondary
              label="Admin report inbox"
              onPress={() => router.push("/admin/reports")}
            />
          )}
          <Button
            secondary
            danger
            label="Sign out"
            disabled={busy}
            onPress={() => void act(logout)}
          />
          <Button
            secondary
            danger
            label="Delete account"
            disabled={busy}
            onPress={() =>
              Alert.alert(
                "Delete your account?",
                "Your posts, comments and photos will be removed. Communities you created will be archived. This cannot be undone.",
                [
                  { text: "Keep account", style: "cancel" },
                  {
                    text: "Delete account",
                    style: "destructive",
                    onPress: () =>
                      void act(async () => {
                        await deletion({});
                        await logout();
                      }),
                  },
                ],
              )
            }
          />
          <Text
            style={{
              color: colors.muted,
              fontSize: 13,
              lineHeight: 20,
              textAlign: "center",
            }}
          >
            Codexgram beta · 1.0.0{"\n"}Light and dark appearance follow your
            device settings.
          </Text>
        </>
      )}
      {sources && (
        <Sheet title="Choose profile photo" onClose={() => setSources(false)}>
          <Button
            secondary
            label="Camera"
            onPress={() => {
              setSources(false);
              void act(async () => {
                const p = await selectPhoto(true);
                if (p) setPhoto(p);
              });
            }}
          />
          <Button
            secondary
            label="Photo library"
            onPress={() => {
              setSources(false);
              void act(async () => {
                const p = await selectPhoto(false);
                if (p) setPhoto(p);
              });
            }}
          />
          <Button secondary label="Cancel" onPress={() => setSources(false)} />
        </Sheet>
      )}
    </Screen>
  );
}
