import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useSession } from "@/providers/session";
import { AuthScreen } from "@/features/auth/auth-screen";
import { Screen } from "@/components/ui/screen";
import { StateView } from "@/components/ui/state-view";
import { Button } from "@/components/ui/button";
export default function Index() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user, loading, error, retry } = useSession();
  if (!isLoaded || loading)
    return (
      <Screen>
        <StateView title="Finding your people…" loading />
      </Screen>
    );
  if (!isSignedIn) return <AuthScreen />;
  if (user && user.status !== "active")
    return (
      <Screen>
        <StateView
          title="Account unavailable"
          detail="This account is suspended or being deleted."
        />
        <Button secondary label="Sign out" onPress={() => void signOut()} />
      </Screen>
    );
  if (error)
    return (
      <Screen>
        <StateView
          title="Could not open your account"
          detail={error}
          onRetry={retry}
        />
        <Button secondary label="Sign out" onPress={() => void signOut()} />
      </Screen>
    );
  if (!user)
    return (
      <Screen>
        <StateView title="Preparing your account…" loading />
      </Screen>
    );
  return (
    <Redirect
      href={
        user.onboardingComplete
          ? "/(tabs)"
          : user.username
            ? "/(onboarding)/communities"
            : "/(onboarding)/username"
      }
    />
  );
}
