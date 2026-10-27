import React, { useState } from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { StateView } from "@/components/ui/state-view";
import { FeedList } from "@/features/feed/feed-screen";
import { ContentMenu } from "@/features/moderation/content-menu";
import { useTheme } from "@/theme/theme-provider";
export function ProfileScreen({ userId }: { userId: Id<"users"> }) {
  const { colors } = useTheme();
  const profile = useQuery(api.users.profile, { userId });
  const [menu, setMenu] = useState(false);
  if (profile === undefined)
    return (
      <Screen>
        <StateView title="Opening profile…" loading />
      </Screen>
    );
  if (!profile)
    return (
      <Screen>
        <StateView title="Account unavailable" />
      </Screen>
    );
  return (
    <Screen scroll={false}>
      <FeedList
        userId={userId}
        header={
          <View style={{ gap: 16, paddingBottom: 24, alignItems: "center" }}>
            <View
              style={{
                height: 90,
                width: 90,
                borderRadius: 30,
                backgroundColor: colors.secondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {profile.avatarUrl ? (
                <Image
                  source={profile.avatarUrl}
                  style={{ width: 90, height: 90, borderRadius: 30 }}
                />
              ) : (
                <Text
                  style={{
                    fontSize: 40,
                    fontWeight: "800",
                    color: colors.primary,
                  }}
                >
                  {profile.username[0]?.toUpperCase()}
                </Text>
              )}
            </View>
            <Text
              accessibilityRole="header"
              style={{ fontSize: 28, fontWeight: "800", color: colors.text }}
            >
              @{profile.username}
            </Text>
            {!!profile.bio && (
              <Text
                style={{
                  color: colors.muted,
                  lineHeight: 24,
                  textAlign: "center",
                }}
              >
                {profile.bio}
              </Text>
            )}
            {profile.isMe ? (
              <Button
                secondary
                label="Edit profile & settings"
                onPress={() => router.push("/settings")}
              />
            ) : (
              <>
                <Button
                  secondary
                  label="Account options"
                  onPress={() => setMenu(!menu)}
                />
                {menu && (
                  <ContentMenu
                    target={{ type: "user", id: userId }}
                    authorId={userId}
                    onDone={() => setMenu(false)}
                  />
                )}
              </>
            )}
            <Text
              style={{
                alignSelf: "flex-start",
                fontSize: 21,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              Through {profile.isMe ? "your" : "their"} lens
            </Text>
          </View>
        }
      />
    </Screen>
  );
}
