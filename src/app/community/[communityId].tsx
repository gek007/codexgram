import React from "react";
import { useLocalSearchParams } from "expo-router";
import { CommunityScreen } from "@/features/communities/community-screen";
import type { Id } from "../../../convex/_generated/dataModel";
export default function Community() {
  const { communityId } = useLocalSearchParams<{ communityId: string }>();
  return (
    <CommunityScreen
      key={communityId}
      communityId={communityId as Id<"communities">}
    />
  );
}
