import React from "react";
import { useLocalSearchParams } from "expo-router";
import { ComposerScreen } from "@/features/posts/composer-screen";
import type { Id } from "../../../../convex/_generated/dataModel";
export default function EditPost() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  return <ComposerScreen key={postId} postId={postId as Id<"posts">} />;
}
