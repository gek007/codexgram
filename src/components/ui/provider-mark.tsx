import React from "react";
import { Image } from "expo-image";
/** Bundled vector marks keep provider buttons recognizable without a network request. */
export function ProviderMark({
  provider,
}: {
  provider: "google" | "facebook";
}) {
  const body =
    provider === "facebook"
      ? '<circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="white" d="M13.6 24v-10h3.3l.5-3.9h-3.8V7.6c0-1.1.3-1.9 1.9-1.9h2V2.2c-.4-.1-1.6-.2-2.9-.2-2.9 0-4.8 1.7-4.8 4.9v3.2H6.6V14h3.2v10z"/>'
      : '<path fill="#4285F4" d="M22.6 12.2c0-.7-.1-1.4-.2-2.2H12v4.3h6a5.2 5.2 0 0 1-2.2 3.3v2.8h3.6c2.1-1.9 3.2-4.7 3.2-8.2z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.2 1-3.8 1-2.9 0-5.4-1.9-6.3-4.5H2v2.9A11.2 11.2 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.7 14a6.7 6.7 0 0 1 0-4V7H2a11 11 0 0 0 0 10z"/><path fill="#EA4335" d="M12 5.5c1.7 0 3.2.6 4.4 1.7l3.3-3.3A10.6 10.6 0 0 0 12 1 11.2 11.2 0 0 0 2 7l3.7 3c.9-2.6 3.4-4.5 6.3-4.5z"/>';
  return (
    <Image
      accessible={false}
      source={{
        uri: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">${body}</svg>`)}`,
      }}
      style={{ width: 24, height: 24 }}
    />
  );
}
