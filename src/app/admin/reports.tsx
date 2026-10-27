import React, { useState } from "react";
import { FlatList, Text, View, Alert } from "react-native";
import { Image } from "expo-image";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Screen } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { StateView } from "@/components/ui/state-view";
import { useTheme } from "@/theme/theme-provider";
import { useSession } from "@/providers/session";
import { errorMessage } from "@/lib/errors";
function ReportInbox() {
  const { colors } = useTheme();
  const { results, status, loadMore } = usePaginatedQuery(
    api.moderation.listReports,
    {},
    { initialNumItems: 20 },
  );
  const resolve = useMutation(api.moderation.resolveReport);
  const [error, setError] = useState("");
  return (
    <Screen
      insetTop={false}
      title="Report inbox"
      subtitle="Review the content and the report before taking action."
      scroll={false}
    >
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ gap: 20 }}
        renderItem={({ item: r }) => (
          <View
            style={{
              gap: 12,
              padding: 18,
              borderRadius: 20,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ color: colors.muted }}>{r.targetType} report</Text>
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              {r.reason}
            </Text>
            {r.photoUrl && (
              <Image
                source={r.photoUrl}
                style={{ width: "100%", aspectRatio: 1, borderRadius: 14 }}
              />
            )}
            <Text style={{ color: colors.text }}>{r.text}</Text>
            {(
              [
                "dismiss",
                ...(r.targetType === "user" ? [] : ["remove"]),
                "suspend",
              ] as const
            ).map((decision) => (
              <Button
                key={decision}
                secondary
                label={
                  decision === "dismiss"
                    ? "Dismiss report"
                    : decision === "remove"
                      ? "Remove content"
                      : "Suspend author"
                }
                onPress={() =>
                  Alert.alert("Resolve this report?", `Action: ${decision}`, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Confirm",
                      onPress: () => {
                        void resolve({
                          reportId: r.id,
                          decision: decision as
                            "dismiss" | "remove" | "suspend",
                        }).catch((e) => setError(errorMessage(e)));
                      },
                    },
                  ])
                }
              />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <StateView
            title={
              status === "LoadingFirstPage"
                ? "Loading reports…"
                : "All caught up"
            }
            loading={status === "LoadingFirstPage"}
          />
        }
        ListFooterComponent={
          status === "CanLoadMore" ? (
            <Button
              secondary
              label="More reports"
              onPress={() => loadMore(20)}
            />
          ) : undefined
        }
      />
    </Screen>
  );
}
export default function Reports() {
  const { user } = useSession();
  return user?.isAdmin ? (
    <ReportInbox />
  ) : (
    <Screen insetTop={false}>
      <StateView title="Admin access required" />
    </Screen>
  );
}
