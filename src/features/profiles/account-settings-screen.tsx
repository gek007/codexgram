import React, { useState } from "react";
import { Text, View, Alert } from "react-native";
import { router } from "expo-router";
import { randomUUID } from "expo-crypto";
import { useAuth } from "@clerk/expo";
import { useMutation } from "convex/react";
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
export function AccountSettingsScreen() {
  const { user } = useSession();
  const { colors } = useTheme();
  const { signOut, getToken } = useAuth();
  const update = useMutation(api.users.updateProfile);
  const deletion = useMutation(api.accounts.requestDeletion);
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
      <Screen title="Your profile photo">
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
      title="Make yourself at home"
      subtitle={`Your account: @${user.username}`}
    >
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
        onPress={() =>
          void act(async () => {
            const p = await selectPhoto(false);
            if (p) setPhoto(p);
          })
        }
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
        label="Sign out"
        disabled={busy}
        onPress={() => void act(logout)}
      />
      <Button
        secondary
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
      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
        Codexgram beta · 1.0.0{"\n"}Light and dark appearance follow your device
        settings.
      </Text>
    </Screen>
  );
}
