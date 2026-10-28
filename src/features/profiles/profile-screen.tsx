import React, { useState } from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/brand";
import { StateView } from "@/components/ui/state-view";
import { FeedList } from "@/features/feed/feed-screen";
import { ContentMenu } from "@/features/moderation/content-menu";
import { useTheme } from "@/theme/theme-provider";
export function ProfileScreen({
  userId,
  insetTop = true,
}: {
  userId: Id<"users">;
  insetTop?: boolean;
}) {
  const { colors } = useTheme();
  const profile = useQuery(api.users.profile, { userId });
  const [menu, setMenu] = useState(false);
  if (profile === undefined)
    return (
      <Screen insetTop={insetTop} insetBottom={!insetTop}>
        <StateView title="Opening profile…" loading />
      </Screen>
    );
  if (!profile)
    return (
      <Screen insetTop={insetTop} insetBottom={!insetTop}>
        <StateView title="Account unavailable" />
      </Screen>
    );
  return (
    <Screen scroll={false} insetTop={insetTop} insetBottom={!insetTop}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Text
          accessibilityRole="header"
          style={{
            flex: 1,
            fontSize: 28,
            fontWeight: "700",
            color: colors.text,
          }}
        >
          {profile.isMe ? "You" : `@${profile.username}`}
        </Text>
        {profile.isMe ? (
          <>
            <IconButton
              icon="plus-circle"
              label="New post"
              onPress={() => router.push("/compose")}
            />
            <IconButton
              icon="settings"
              label="Settings"
              onPress={() => router.push("/settings")}
            />
          </>
        ) : (
          <IconButton
            icon="more-horizontal"
            label="Account options"
            onPress={() => setMenu(!menu)}
          />
        )}
      </View>
      <FeedList
        userId={userId}
        header={
          <View style={{ gap: 16, paddingBottom: 24 }}>
            <View
              style={{ flexDirection: "row", gap: 16, alignItems: "center" }}
            >
              <View
                style={{
                  height: 100,
                  width: 100,
                  borderRadius: 50,
                  backgroundColor: colors.secondary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {profile.avatarUrl ? (
                  <Image
                    source={profile.avatarUrl}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: 40,
                      fontWeight: "700",
                      color: colors.primary,
                    }}
                  >
                    {profile.username[0]?.toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: colors.muted,
                  }}
                >
                  @{profile.username}
                </Text>
                {!!profile.bio && (
                  <Text
                    style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}
                  >
                    {profile.bio}
                  </Text>
                )}
                {profile.isMe && (
                  <Button
                    variant="outline"
                    label="Edit profile"
                    onPress={() => router.push("/settings/profile")}
                  />
                )}
              </View>
            </View>
            {menu && !profile.isMe && (
              <ContentMenu
                target={{ type: "user", id: userId }}
                authorId={userId}
                onDone={() => setMenu(false)}
              />
            )}
          </View>
        }
      />
    </Screen>
  );
}
