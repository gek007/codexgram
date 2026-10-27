import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
  const [accent, setAccent] = useState("#6841D9");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Screen
      title="Make a little world"
      subtitle="Give your shared interest a place to grow."
    >
      <Field
        label="Community name"
        maxLength={60}
        value={name}
        onChangeText={setName}
      />
      <Field
        label="Unique handle"
        autoCapitalize="none"
        maxLength={24}
        value={handle}
        onChangeText={setHandle}
        placeholder="3–24 letters, numbers or underscores"
      />
      <Field
        label="About this community"
        multiline
        maxLength={500}
        value={description}
        onChangeText={setDescription}
      />
      <Text style={{ color: colors.text, fontWeight: "700" }}>
        Pick a color
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {["#6841D9", "#B94336", "#167B70", "#9D3772", "#3159AE"].map(
          (color) => (
            <Pressable
              key={color}
              accessibilityRole="radio"
              accessibilityLabel={`Community color ${color}`}
              accessibilityState={{ selected: color === accent }}
              onPress={() => setAccent(color)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: color,
                borderWidth: color === accent ? 4 : 0,
                borderColor: colors.text,
              }}
            />
          ),
        )}
      </View>
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
