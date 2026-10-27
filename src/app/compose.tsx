import React from "react";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { IconButton } from "@/components/ui/brand";
import { ComposerScreen } from "@/features/posts/composer-screen";
import type { Id } from "../../convex/_generated/dataModel";
export default function Compose() {
  const { communityId } = useLocalSearchParams<{ communityId?: string }>();
  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <IconButton
              icon="x"
              label="Close composer"
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <ComposerScreen
        communityId={communityId as Id<"communities"> | undefined}
      />
    </>
  );
}
