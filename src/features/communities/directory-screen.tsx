import React, { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
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
  return (
    <Screen
      title={onboarding ? "Find your people" : "Discover"}
      subtitle={
        onboarding
          ? "Join at least one community to fill your feed."
          : "Small worlds. Shared obsessions. A place for yours."
      }
      scroll={false}
    >
      <Field
        label="Search communities"
        placeholder="Photography, plants, everyday magic…"
        value={search}
        onChangeText={setSearch}
      />
      <Button
        secondary
        label="Create a community"
        onPress={() => router.push("/community/create")}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <FlatList
        style={{ flex: 1 }}
        data={results}
        keyExtractor={(c) => c.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
        renderItem={({ item: c }) => (
          <View
            style={{
              padding: 18,
              borderRadius: 20,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 12,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 15,
                  backgroundColor: c.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 22, color: "#fff", fontWeight: "800" }}
                >
                  {c.name[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 19,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  {c.name}
                </Text>
                <Text style={{ color: colors.muted }}>@{c.handle}</Text>
              </View>
            </View>
            {!!c.description && (
              <Text style={{ color: colors.muted, lineHeight: 21 }}>
                {c.description}
              </Text>
            )}
            <View style={{ gap: 8 }}>
              <Button
                secondary
                label="View community"
                onPress={() =>
                  router.push({
                    pathname: "/community/[communityId]",
                    params: { communityId: c.id },
                  })
                }
              />
              {c.joined ? (
                <Button
                  secondary
                  label="Joined"
                  disabled={busy || c.canModerate}
                  onPress={() => void act(() => leave({ communityId: c.id }))}
                />
              ) : (
                <Button
                  label="Join community"
                  disabled={busy}
                  onPress={() => void act(() => join({ communityId: c.id }))}
                />
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <StateView
            title={
              status === "LoadingFirstPage"
                ? "Finding communities…"
                : "A community starts with you"
            }
            detail={
              status === "LoadingFirstPage"
                ? undefined
                : "Create the first community or try another search."
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
          label="Let’s go"
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
