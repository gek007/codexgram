import React from "react";
import { useLocalSearchParams } from "expo-router";
import { ComposerScreen } from "@/features/posts/composer-screen";
import type { Id } from "../../convex/_generated/dataModel";
export default function Compose() {
  const { communityId } = useLocalSearchParams<{ communityId?: string }>();
  return (
    <ComposerScreen
      communityId={communityId as Id<"communities"> | undefined}
    />
  );
}
