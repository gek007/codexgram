import React, { useState } from "react";
import { FlatList, Text, View, Alert, Pressable } from "react-native";
import { Image } from "expo-image";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Screen } from "@/components/ui/screen";
import { Feather } from "@expo/vector-icons";
import { Sheet } from "@/components/ui/sheet";
import { ActionRow } from "@/components/ui/action-row";
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
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");
  return (
    <Screen
      insetTop={false}

      scroll={false}
    >
      <Text style={{ color: colors.text, fontSize: 30, fontWeight: "700" }}>
        Reports
      </Text>
      <Text style={{ color: colors.muted, fontSize: 13 }}>
        Admin only · Open reports
      </Text>
      {!!error && !selected && (
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
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Review ${r.targetType} report: ${r.reason}`}
              onPress={() => setSelected(r.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                minHeight: 48,
              }}
            >
              {r.photoUrl ? (
                <Image
                  source={r.photoUrl}
                  style={{ width: 48, height: 48, borderRadius: 8 }}
                />
              ) : (
                <Feather name="flag" size={26} color={colors.primary} />
              )}
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  {r.targetType[0].toUpperCase() + r.targetType.slice(1)} report
                </Text>
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                  {r.reason}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.muted} />
            </Pressable>
            {selected === r.id && (
              <Sheet
                expanded
                title="Review report"
                onClose={() => {
                  setSelected(null);
                  setError("");
                }}
              >
                {!!error && (
                  <Text
                    accessibilityRole="alert"
                    style={{ color: colors.danger }}
                  >
                    {error}
                  </Text>
                )}
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: "700",
                    fontSize: 20,
                  }}
                >
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
                  <ActionRow
                    key={decision}
                    icon={
                      decision === "dismiss"
                        ? "check-circle"
                        : decision === "remove"
                          ? "trash-2"
                          : "user-x"
                    }
                    danger={decision !== "dismiss"}
                    label={
                      decision === "dismiss"
                        ? "Dismiss report"
                        : decision === "remove"
                          ? "Remove content"
                          : "Suspend author"
                    }
                    onPress={() =>
                      Alert.alert(
                        "Resolve this report?",
                        `Action: ${decision}`,
                        [
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
                        ],
                      )
                    }
                  />
                ))}
              </Sheet>
            )}
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
