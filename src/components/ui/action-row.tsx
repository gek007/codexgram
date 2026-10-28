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
  grouped = false,
}: {
  label: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  onPress?: () => void;
  danger?: boolean;
  detail?: string;
  disabled?: boolean;
  chevron?: boolean;
  grouped?: boolean;
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
    borderRadius: grouped ? 0 : 12,
    borderWidth: grouped ? 0 : 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: danger ? colors.danger + "10" : colors.surface,
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

/** A single bordered group with divided rows, as in the approved settings and sheets. */
export function ActionGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: colors.surface,
      }}
    >
      {!!title && (
        <Text
          style={{
            color: colors.muted,
            fontSize: 13,
            paddingHorizontal: 14,
            paddingTop: 14,
            paddingBottom: 4,
          }}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
