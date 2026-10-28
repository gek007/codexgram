import React from "react";
import { useSession } from "@/providers/session";
import { ProfileScreen } from "@/features/profiles/profile-screen";
export default function Profile() {
  const { user } = useSession();
  return user ? <ProfileScreen userId={user.id} /> : null;
}
