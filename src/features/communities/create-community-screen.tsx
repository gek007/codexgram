import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CommunityArt, communityAccents } from "@/components/ui/community-art";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import type { Id } from "../../../convex/_generated/dataModel";
import { Illustration } from "@/components/ui/illustration";
import { Field } from "@/components/ui/field";
import { errorMessage } from "@/lib/errors";
import { useTheme } from "@/theme/theme-provider";
export function CreateCommunityScreen() {
  const { colors } = useTheme();
  const create = useMutation(api.communities.create);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [handleError, setHandleError] = useState("");
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState("#5B36E8");
  const [busy, setBusy] = useState(false);
  const [createdId, setCreatedId] = useState<Id<"communities"> | null>(null);
  const [error, setError] = useState("");
  if (createdId)
    return (
      <Screen insetTop={false}>
        <Illustration kind="success" size={176} />
        <Text
          accessibilityRole="header"
          style={{
            color: colors.text,
            fontSize: 32,
            lineHeight: 38,
            fontWeight: "700",
            textAlign: "center",
            letterSpacing: -1,
          }}
        >
          Your community is ready.
        </Text>
        <Text
          style={{
            color: colors.muted,
            fontSize: 16,
            lineHeight: 24,
            textAlign: "center",
          }}
        >
          {name} is live and open to everyone in the beta.
        </Text>
        <View
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <CommunityArt
            accent={accent}
            style={{
              width: "100%",
              height: 128,
              aspectRatio: undefined,
              borderRadius: 0,
            }}
          />
          <View style={{ padding: 16, gap: 8 }}>
            <Text
              style={{ fontSize: 20, fontWeight: "700", color: colors.text }}
            >
              {name}
            </Text>
            <Text style={{ color: colors.muted, lineHeight: 22 }}>
              {description}
            </Text>
          </View>
        </View>
        <Text
          style={{
            backgroundColor: colors.secondary,
            padding: 16,
            borderRadius: 12,
            color: colors.text,
            lineHeight: 23,
          }}
        >
          You’re its first member. Share a photo to get things started.
        </Text>
        <Button
          label="Share a photo"
          onPress={() =>
            router.replace({
              pathname: "/compose",
              params: { communityId: createdId },
            })
          }
        />
        <Button
          secondary
          label="Go to community"
          onPress={() =>
            router.replace({
              pathname: "/community/[communityId]",
              params: { communityId: createdId },
            })
          }
        />
      </Screen>
    );
  return (
    <Screen
      insetTop={false}
      title="Make a space for your people."
      subtitle="Create a public community for the photos you love and the people who get it."
    >
      <Field
        label="Community name"
        maxLength={60}
        value={name}
        onChangeText={setName}
      />
      <Field
        label="Community handle"
        autoCapitalize="none"
        maxLength={24}
        value={handle}
        onChangeText={(value) => {
          setHandle(value);
          setHandleError("");
        }}
        autoCorrect={false}
        placeholder="3–24 letters, numbers or underscores"
      />
      <Text
        style={{
          color: handleError ? colors.danger : colors.muted,
          fontSize: 14,
          lineHeight: 20,
        }}
        accessibilityRole={handleError ? "alert" : undefined}
      >
        {handleError || "3–24 letters, numbers or underscores. No @ or spaces."}
      </Text>
      <Field
        label="Description"
        multiline
        maxLength={500}
        value={description}
        onChangeText={setDescription}
      />
      <Text style={{ color: colors.text, fontWeight: "700" }}>
        Accent color
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {communityAccents.map((color) => (
          <Pressable
            key={color}
            accessibilityRole="radio"
            accessibilityLabel={`Community color ${color}`}
            accessibilityState={{ selected: color === accent }}
            onPress={() => setAccent(color)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: color,
              borderWidth: color === accent ? 4 : 0,
              borderColor: colors.text,
            }}
          />
        ))}
      </View>
      <Text style={{ color: colors.muted, fontSize: 14 }}>
        Community cover preview
      </Text>
      <CommunityArt
        accent={accent}
        style={{ width: "100%", height: 120, aspectRatio: undefined }}
      />
      <Text style={{ color: colors.muted, fontSize: 14 }}>
        Communities are public to everyone in the beta.
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <Button
        label="Create community"
        loading={busy}
        onPress={() => {
          if (busy) return;
          const normalizedHandle = handle.trim().toLowerCase();
          if (!/^[a-z0-9_]{3,24}$/.test(normalizedHandle)) {
            setHandleError(
              "Use 3–24 letters, numbers or underscores. Don’t include @ or spaces.",
            );
            return;
          }
          setHandleError("");
          setBusy(true);
          setError("");
          void create({ name, handle: normalizedHandle, description, accent })
            .then((id) => setCreatedId(id))
            .catch((e) => setError(errorMessage(e)))
            .finally(() => setBusy(false));
        }}
      />
    </Screen>
  );
}
