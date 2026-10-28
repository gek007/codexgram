import React, { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/brand";
import { CommunityArt } from "@/components/ui/community-art";
import { StateView } from "@/components/ui/state-view";
import { useTheme } from "@/theme/theme-provider";
import { errorMessage } from "@/lib/errors";
export function DirectoryScreen({
  onboarding = false,
}: {
  onboarding?: boolean;
}) {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { results, status, loadMore } = usePaginatedQuery(
    api.communities.list,
    { search },
    { initialNumItems: 20 },
  );
  const joined = usePaginatedQuery(
    api.communities.joined,
    onboarding ? {} : "skip",
    { initialNumItems: 30 },
  );
  const join = useMutation(api.communities.join);
  const leave = useMutation(api.communities.leave);
  const complete = useMutation(api.users.completeOnboarding);
  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const rows = onboarding || !!search.trim();
  return (
    <Screen scroll={false} insetTop={!onboarding} insetBottom={onboarding}>
      <View style={{ gap: 12 }}>
        {onboarding && <Text style={{ color: colors.muted }}>2 of 2</Text>}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text
            accessibilityRole="header"
            style={{
              flex: 1,
              fontSize: onboarding ? 28 : 32,
              lineHeight: onboarding ? 34 : 38,
              letterSpacing: -1,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            {onboarding ? "Find your kind of people." : "Discover"}
          </Text>
          <View style={{ alignItems: "center", gap: 2 }}>
            <IconButton
              icon="plus"
              label="Create a community"
              filled
              onPress={() => router.push("/community/create")}
            />
            <Text style={{ color: colors.muted, fontSize: 12 }}>Create</Text>
          </View>
        </View>
        {onboarding && (
          <Text style={{ fontSize: 16, lineHeight: 24, color: colors.muted }}>
            Join at least one community to get started.
          </Text>
        )}
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          backgroundColor: colors.surface,
          paddingHorizontal: 14,
        }}
      >
        <Feather name="search" size={21} color={colors.text} />
        <TextInput
          accessibilityLabel="Search communities"
          placeholder="Search by community name"
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1, minHeight: 48, fontSize: 16, color: colors.text }}
        />
        {!!search && (
          <IconButton
            icon="x"
            label="Clear search"
            onPress={() => setSearch("")}
          />
        )}
      </View>
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <FlatList
        key={rows ? "rows" : "grid"}
        numColumns={rows ? 1 : 2}
        style={{ flex: 1 }}
        data={results}
        keyExtractor={(c) => c.id}
        keyboardShouldPersistTaps="handled"
        columnWrapperStyle={rows ? undefined : { gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
        renderItem={({ item: c }) => (
          <Pressable
            accessibilityRole={onboarding ? undefined : "button"}
            accessible={!onboarding}
            accessibilityLabel={onboarding ? undefined : `View ${c.name}`}
            onPress={() =>
              router.push({
                pathname: "/community/[communityId]",
                params: { communityId: c.id },
              })
            }
            style={{
              ...(rows
                ? {
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                    gap: 14,
                  }
                : { flex: 1, maxWidth: "48.5%" }),
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              backgroundColor:
                onboarding && c.joined ? colors.secondary : colors.surface,
              overflow: "hidden",
            }}
          >
            <CommunityArt
              accent={c.accent}
              style={
                rows
                  ? { width: 82, height: 82 }
                  : { width: "100%", borderRadius: 12 }
              }
            />
            <View
              style={{
                flex: rows ? 1 : undefined,
                padding: rows ? 0 : 10,
                gap: 4,
              }}
            >
              <Text
                style={{ fontSize: 17, fontWeight: "700", color: colors.text }}
              >
                {c.name}
              </Text>
              <Text
                numberOfLines={3}
                style={{ fontSize: 14, lineHeight: 20, color: colors.muted }}
              >
                {c.description || `@${c.handle}`}
              </Text>
            </View>
            {onboarding ? (
              <IconButton
                icon={c.joined ? "check" : "plus"}
                label={c.joined ? `Leave ${c.name}` : `Join ${c.name}`}
                filled={c.joined}
                disabled={busy || (c.joined && c.canModerate)}
                onPress={() =>
                  void act(() =>
                    c.joined
                      ? leave({ communityId: c.id })
                      : join({ communityId: c.id }),
                  )
                }
              />
            ) : rows ? (
              <Feather name="chevron-right" size={22} color={colors.muted} />
            ) : null}
          </Pressable>
        )}
        ListEmptyComponent={
          <StateView
            title={
              status === "LoadingFirstPage"
                ? "Finding communities…"
                : search
                  ? "No communities found"
                  : "A community starts with you"
            }
            detail={
              status === "LoadingFirstPage"
                ? undefined
                : "Create a community or try another search."
            }
            loading={status === "LoadingFirstPage"}
          />
        }
        ListFooterComponent={
          status === "CanLoadMore" ? (
            <Button
              secondary
              label="More communities"
              onPress={() => loadMore(20)}
            />
          ) : undefined
        }
      />
      {onboarding && (
        <Button
          label={
            joined.results.length
              ? `Continue with ${joined.results.length} ${joined.results.length === 1 ? "community" : "communities"}`
              : "Continue"
          }
          disabled={!joined.results.length}
          loading={busy}
          onPress={() =>
            void act(async () => {
              await complete({});
              router.replace("/");
            })
          }
        />
      )}
    </Screen>
  );
}
