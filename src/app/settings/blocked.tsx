import React, { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { StateView } from "@/components/ui/state-view";
import { useTheme } from "@/theme/theme-provider";
import { errorMessage } from "@/lib/errors";
export default function Blocked() {
  const { colors } = useTheme();
  const { results, status, loadMore } = usePaginatedQuery(
    api.moderation.blocked,
    {},
    { initialNumItems: 20 },
  );
  const unblock = useMutation(api.moderation.unblock);
  const [error, setError] = useState("");
  return (
    <Screen title="Blocked accounts" scroll={false}>
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ gap: 14 }}
        renderItem={({ item }) => (
          <View
            style={{
              gap: 8,
              padding: 16,
              borderRadius: 18,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              @{item.username}
            </Text>
            <Button
              secondary
              label="Unblock"
              onPress={() => {
                void unblock({ userId: item.id }).catch((e) =>
                  setError(errorMessage(e)),
                );
              }}
            />
          </View>
        )}
        ListEmptyComponent={
          <StateView
            title={
              status === "LoadingFirstPage" ? "Loading…" : "No blocked accounts"
            }
            loading={status === "LoadingFirstPage"}
          />
        }
        ListFooterComponent={
          status === "CanLoadMore" ? (
            <Button
              secondary
              label="More accounts"
              onPress={() => loadMore(20)}
            />
          ) : undefined
        }
      />
    </Screen>
  );
}
