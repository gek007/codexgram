import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useTheme } from "@/theme/theme-provider";
import { CommunityArt } from "@/components/ui/community-art";
import { Screen } from "@/components/ui/screen";
import { IconButton } from "@/components/ui/brand";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionRow } from "@/components/ui/action-row";
import { Feather } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { StateView } from "@/components/ui/state-view";
import { FeedList } from "@/features/feed/feed-screen";
import { errorMessage } from "@/lib/errors";
function Bans({ communityId }: { communityId: Id<"communities"> }) {
  const { colors } = useTheme();
  const { results, status, loadMore } = usePaginatedQuery(
    api.moderation.bans,
    { communityId },
    { initialNumItems: 10 },
  );
  const unban = useMutation(api.moderation.unban);
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: colors.text, fontWeight: "700" }}>
        Banned members
      </Text>
      {results.map((row) => (
        <Button
          key={row.id}
          secondary
          label={`Unban @${row.username}`}
          onPress={() => {
            void unban({ communityId, userId: row.id }).catch(() => {});
          }}
        />
      ))}
      {status === "CanLoadMore" && (
        <Button
          secondary
          label="More banned members"
          onPress={() => loadMore(10)}
        />
      )}
    </View>
  );
}
export function CommunityScreen({
  communityId,
}: {
  communityId: Id<"communities">;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const c = useQuery(api.communities.get, { communityId });
  const join = useMutation(api.communities.join);
  const leave = useMutation(api.communities.leave);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"posts" | "about">("posts");
  const [tools, setTools] = useState(false);
  if (c === undefined)
    return (
      <Screen>
        <IconButton
          icon="chevron-left"
          label="Back"
          onPress={() => router.back()}
        />
        <StateView title="Opening community…" loading />
      </Screen>
    );
  if (!c)
    return (
      <Screen>
        <IconButton
          icon="chevron-left"
          label="Back"
          onPress={() => router.back()}
        />
        <StateView
          title="Community unavailable"
          detail="It may have been archived."
        />
      </Screen>
    );
  const activeTab = c.joined ? tab : "posts";
  return (
    <Screen insetTop={false} scroll={false} padding={0} gap={0}>
      <FeedList
        communityId={communityId}
        itemInset={16}
        hideItems={activeTab === "about"}
        header={
          <View style={{ gap: 14, paddingBottom: 18 }}>
            <View>
              <CommunityArt
                accent={c.accent}
                cover
                style={{
                  width: "100%",
                  height: 200 + insets.top,
                  aspectRatio: undefined,
                  borderRadius: 0,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: insets.top + 8,
                  left: 16,
                  backgroundColor: colors.surface,
                  borderRadius: 24,
                }}
              >
                <IconButton
                  icon="chevron-left"
                  label="Back"
                  onPress={() => router.back()}
                />
              </View>
            </View>
            <View
              style={{
                marginTop: -34,
                backgroundColor: colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 16,
                gap: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginTop: -22,
                  padding: 0,
                  borderRadius: 20,
                  backgroundColor: colors.background,
                }}
              >
                <CommunityArt
                  accent={c.accent}
                  style={{ width: 64, height: 64 }}
                />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text
                    accessibilityRole="header"
                    style={{
                      fontSize: 28,
                      lineHeight: 34,
                      fontWeight: "700",
                      letterSpacing: -1,
                      color: colors.text,
                    }}
                  >
                    {c.name}
                  </Text>
                  <Text style={{ color: colors.primary, fontSize: 14 }}>
                    {c.joined ? "✓ Joined" : `@${c.handle}`}
                  </Text>
                </View>
              </View>
              {!!c.description && (
                <Text
                  style={{ color: colors.muted, fontSize: 16, lineHeight: 24 }}
                >
                  {c.description}
                </Text>
              )}
              {!!error && (
                <Text
                  accessibilityRole="alert"
                  style={{ color: colors.danger }}
                >
                  {error}
                </Text>
              )}
              {c.canPost ? (
                <Button
                  icon={
                    <Feather name="plus" size={22} color={colors.onPrimary} />
                  }
                  label="New post"
                  onPress={() =>
                    router.push({
                      pathname: "/compose",
                      params: { communityId },
                    })
                  }
                />
              ) : (
                <Button
                  label={c.joined ? "Posting unavailable" : "Join community"}
                  loading={busy}
                  disabled={c.joined}
                  onPress={() => {
                    setBusy(true);
                    void join({ communityId })
                      .catch((e) => setError(errorMessage(e)))
                      .finally(() => setBusy(false));
                  }}
                />
              )}
              {activeTab === "about" && c.joined && !c.canModerate && (
                <Button
                  secondary
                  label="Leave community"
                  loading={busy}
                  onPress={() => {
                    setBusy(true);
                    void leave({ communityId })
                      .catch((e) => setError(errorMessage(e)))
                      .finally(() => setBusy(false));
                  }}
                />
              )}
              {activeTab === "about" && c.canModerate && (
                <>
                  <ActionRow
                    icon="shield"
                    label={tools ? "Hide creator tools" : "Creator tools"}
                    onPress={() => setTools(!tools)}
                  />
                  {tools && <Bans communityId={communityId} />}
                </>
              )}
              {c.joined ? (
                <View
                  accessibilityRole="tablist"
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  {(["posts", "about"] as const).map((value) => (
                    <Pressable
                      key={value}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: activeTab === value }}
                      onPress={() => setTab(value)}
                      style={{
                        flex: 1,
                        minHeight: 48,
                        justifyContent: "center",
                        alignItems: "center",
                        borderBottomWidth: 2,
                        borderColor:
                          activeTab === value ? colors.primary : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color:
                            activeTab === value ? colors.primary : colors.muted,
                          fontWeight: activeTab === value ? "600" : "400",
                        }}
                      >
                        {value === "posts" ? "Posts" : "About"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                    color: colors.text,
                    paddingTop: 8,
                  }}
                >
                  Recent photos
                </Text>
              )}
              {activeTab === "about" && (
                <Text style={{ color: colors.muted, lineHeight: 24 }}>
                  @{c.handle}
                  {"\n"}Public community
                </Text>
              )}
            </View>
          </View>
        }
      />
    </Screen>
  );
}
