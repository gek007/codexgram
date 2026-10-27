import React from "react";
import { Stack, router } from "expo-router";
import { IconButton } from "@/components/ui/brand";
export function ComposerHeader({ busy }: { busy: boolean }) {
  return (
    <Stack.Screen
      options={{
        gestureEnabled: !busy,
        headerLeft: () => (
          <IconButton
            disabled={busy}
            icon="x"
            label="Close composer"
            onPress={() => router.back()}
          />
        ),
      }}
    />
  );
}
