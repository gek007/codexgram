import React from "react";
import { useLocalSearchParams } from "expo-router";
import { ProfileScreen } from "@/features/profiles/profile-screen";
import type { Id } from "../../../convex/_generated/dataModel";
export default function Profile() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  return (
    <ProfileScreen
      insetTop={false}
      key={userId}
      userId={userId as Id<"users">}
    />
  );
}
