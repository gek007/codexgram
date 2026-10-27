import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/theme-provider";
export function ActionRow({
  label,
  icon,
  onPress,
  danger = false,
  detail,
  disabled = false,
  chevron = true,
}: {
  label: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  onPress?: () => void;
  danger?: boolean;
  detail?: string;
  disabled?: boolean;
  chevron?: boolean;
}) {
  const { colors } = useTheme();
  const color = danger ? colors.danger : colors.text;
  const content = (
    <>
      {icon && <Feather name={icon} size={22} color={color} />}
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{ fontSize: 16, lineHeight: 23, fontWeight: "500", color }}
        >
          {label}
        </Text>
        {!!detail && (
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
            {detail}
          </Text>
        )}
      </View>
      {onPress && chevron && (
        <Feather name="chevron-right" size={18} color={colors.muted} />
      )}
    </>
  );
  const style = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
    minHeight: 56,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  };
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        style,
        { opacity: disabled ? 0.45 : pressed ? 0.65 : 1 },
      ]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={style}>{content}</View>
  );
}
