import React from "react";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "@/theme/theme-provider";
import { SessionProvider } from "./session";
import { StateView } from "@/components/ui/state-view";
const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const url = process.env.EXPO_PUBLIC_CONVEX_URL;
const client = url ? new ConvexReactClient(url) : null;
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {key && client ? (
        <ClerkProvider publishableKey={key} tokenCache={tokenCache}>
          <ConvexProviderWithClerk client={client} useAuth={useAuth}>
            <SessionProvider>{children}</SessionProvider>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      ) : (
        <StateView
          title="Setup needed"
          detail="Add the Clerk and Convex environment settings, then restart the app."
        />
      )}
    </ThemeProvider>
  );
}
