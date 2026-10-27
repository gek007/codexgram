import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useTheme } from "@/theme/theme-provider";
import { Screen } from "@/components/ui/screen";
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
  const c = useQuery(api.communities.get, { communityId });
  const join = useMutation(api.communities.join);
  const leave = useMutation(api.communities.leave);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tools, setTools] = useState(false);
  if (c === undefined)
    return (
      <Screen>
        <StateView title="Opening community…" loading />
      </Screen>
    );
  if (!c)
    return (
      <Screen>
        <StateView
          title="Community unavailable"
          detail="It may have been archived."
        />
      </Screen>
    );
  return (
    <Screen scroll={false}>
      <FeedList
        communityId={communityId}
        header={
          <View style={{ gap: 14, paddingBottom: 18 }}>
            <View
              style={{
                backgroundColor: c.accent,
                padding: 24,
                borderRadius: 24,
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 34, fontWeight: "800", color: "#fff" }}>
                {c.name}
              </Text>
              <Text style={{ color: "#fff", fontSize: 15, lineHeight: 22 }}>
                {c.description || "A place for your perspective."}
              </Text>
            </View>
            {!!error && (
              <Text accessibilityRole="alert" style={{ color: colors.danger }}>
                {error}
              </Text>
            )}
            {c.canPost ? (
              <Button
                label="Share a photo here"
                onPress={() =>
                  router.push({ pathname: "/compose", params: { communityId } })
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
            {c.joined && !c.canModerate && (
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
            {c.canModerate && (
              <>
                <Button
                  secondary
                  label={tools ? "Hide creator tools" : "Creator tools"}
                  onPress={() => setTools(!tools)}
                />
                {tools && <Bans communityId={communityId} />}
              </>
            )}
          </View>
        }
      />
    </Screen>
  );
}
