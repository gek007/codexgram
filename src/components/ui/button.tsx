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
  variant,
  icon,
  iconOnly = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  secondary?: boolean;
  danger?: boolean;
  variant?:
    "primary" | "secondary" | "tertiary" | "soft" | "provider" | "outline";
  icon?: React.ReactNode;
  iconOnly?: boolean;
}) {
  const { colors } = useTheme();
  const blocked = disabled || loading;
  const role = variant ?? (secondary ? "secondary" : "primary");
  const plain = role === "tertiary";
  const foreground = danger
    ? colors.danger
    : role === "primary"
      ? colors.onPrimary
      : role === "soft" || role === "provider" || role === "outline"
        ? colors.text
        : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        borderRadius: role === "soft" || role === "outline" ? 10 : 999,
        paddingHorizontal: iconOnly ? 12 : 20,
        paddingVertical: 12,
        backgroundColor: plain
          ? "transparent"
          : role === "primary"
            ? danger
              ? colors.danger
              : colors.primary
            : role === "soft"
              ? colors.secondary
              : colors.surface,
        borderWidth:
          role === "secondary" || role === "provider" || role === "outline"
            ? 1
            : 0,
        borderColor: danger
          ? colors.danger
          : role === "provider" || role === "outline"
            ? colors.border
            : colors.primary,
        opacity: blocked ? 0.45 : pressed ? 0.75 : 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
      })}
    >
      {loading ? (
        <ActivityIndicator
          color={role === "primary" ? colors.onPrimary : foreground}
        />
      ) : (
        icon
      )}
      {!iconOnly && (
        <Text
          style={{
            fontSize: 16,
            lineHeight: 22,
            fontWeight: "600",
            color: role === "primary" ? colors.onPrimary : foreground,
            flexShrink: 1,
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
