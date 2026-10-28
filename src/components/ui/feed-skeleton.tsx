import React from "react";
import { View } from "react-native";
import { useTheme } from "@/theme/theme-provider";
/** Static placeholders avoid motion while the first real feed page loads. */
export function FeedSkeleton() {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading photos"
      style={{ gap: 16 }}
    >
      {[0, 1].map((i) => (
        <View
          key={i}
          accessible={false}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 12,
            gap: 12,
          }}
        >
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.border,
              }}
            />
            <View style={{ gap: 6, flex: 1 }}>
              <View
                style={{
                  height: 12,
                  width: "48%",
                  borderRadius: 6,
                  backgroundColor: colors.border,
                }}
              />
              <View
                style={{
                  height: 10,
                  width: "32%",
                  borderRadius: 5,
                  backgroundColor: colors.border,
                }}
              />
            </View>
          </View>
          <View
            style={{
              width: "100%",
              aspectRatio: 1,
              borderRadius: 10,
              backgroundColor: colors.border,
            }}
          />
          <View
            style={{
              height: 12,
              width: "64%",
              borderRadius: 6,
              backgroundColor: colors.border,
            }}
          />
        </View>
      ))}
    </View>
  );
}
