import React, { useState } from "react";
import { Text, View } from "react-native";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { api } from "../../../convex/_generated/api";
import { useTheme } from "@/theme/theme-provider";
import { Screen } from "@/components/ui/screen";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";
export default function Username() {
  const { colors } = useTheme();
  const save = useMutation(api.users.setUsername);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Screen insetTop={false}>
      <Text style={{ color: colors.muted }}>1 of 2</Text>
      <Text
        accessibilityRole="header"
        style={{
          color: colors.text,
          fontSize: 32,
          lineHeight: 38,
          fontWeight: "700",
          letterSpacing: -1,
        }}
      >
        What should we call you?
      </Text>
      <Text style={{ color: colors.muted, fontSize: 16, lineHeight: 24 }}>
        Your username is how others will find and recognize you on Codexgram.
      </Text>
      <View
        style={{
          width: 120,
          height: 120,
          alignSelf: "center",
          marginVertical: 20,
          borderRadius: 60,
          backgroundColor: colors.secondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{ color: colors.primary, fontSize: 48, fontWeight: "700" }}
        >
          {username[0]?.toUpperCase() || "?"}
        </Text>
      </View>
      <Field
        label="Username"
        placeholder="3–24 letters, numbers or underscores"
        autoCapitalize="none"
        maxLength={24}
        value={username}
        onChangeText={setUsername}
      />
      <Text style={{ color: colors.muted, fontSize: 14 }}>
        3–24 letters, numbers or underscores
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <View style={{ flexGrow: 1, minHeight: 24 }} />
      <Button
        label="Continue"
        loading={busy}
        onPress={() => {
          setBusy(true);
          void save({ username })
            .then(() => router.replace("/(onboarding)/communities"))
            .catch((e) => setError(errorMessage(e)))
            .finally(() => setBusy(false));
        }}
      />
    </Screen>
  );
}
