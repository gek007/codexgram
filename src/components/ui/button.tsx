import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { useTheme } from "@/theme/theme-provider";
export function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  secondary = false,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  secondary?: boolean;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  const blocked = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 50,
        borderRadius: 999,
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: secondary
          ? colors.surface
          : danger
            ? colors.danger
            : colors.primary,
        borderWidth: 1,
        borderColor: danger
          ? colors.danger
          : secondary
            ? colors.border
            : colors.primary,
        opacity: blocked ? 0.55 : pressed ? 0.8 : 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
      })}
    >
      {loading && (
        <ActivityIndicator
          color={secondary ? colors.primary : colors.onPrimary}
        />
      )}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: secondary
            ? danger
              ? colors.danger
              : colors.text
            : colors.onPrimary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
