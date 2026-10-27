import React, { useState } from "react";
import { Text } from "react-native";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { api } from "../../../convex/_generated/api";
import { Screen } from "@/components/ui/screen";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";
export default function Username() {
  const save = useMutation(api.users.setUsername);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Screen
      title="What should we call you?"
      subtitle="Your username is how your communities will know you."
    >
      <Field
        label="Username"
        placeholder="3–24 letters, numbers or underscores"
        autoCapitalize="none"
        maxLength={24}
        value={username}
        onChangeText={setUsername}
      />
      {!!error && <Text accessibilityRole="alert">{error}</Text>}
      <Button
        label="Find my communities"
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
