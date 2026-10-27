import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CommunityArt, communityAccents } from "@/components/ui/community-art";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { errorMessage } from "@/lib/errors";
import { useTheme } from "@/theme/theme-provider";
export function CreateCommunityScreen() {
  const { colors } = useTheme();
  const create = useMutation(api.communities.create);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState("#5B36E8");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
        onChangeText={setHandle}
        placeholder="3–24 letters, numbers or underscores"
      />
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
          setBusy(true);
          setError("");
          void create({ name, handle, description, accent })
            .then((id) =>
              router.replace({
                pathname: "/community/[communityId]",
                params: { communityId: id },
              }),
            )
            .catch((e) => setError(errorMessage(e)))
            .finally(() => setBusy(false));
        }}
      />
    </Screen>
  );
}
