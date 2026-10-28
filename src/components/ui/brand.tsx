import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/theme-provider";

/** Four open corners keep the aperture crisp at every native screen size. */
export function Aperture({ size = 32 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <View accessible={false} style={{ width: size, height: size }}>
      {(["tl", "tr", "bl", "br"] as const).map((corner) => {
        const top = corner[0] === "t",
          left = corner[1] === "l";
        return (
          <View
            key={corner}
            style={{
              position: "absolute",
              width: size * 0.43,
              height: size * 0.43,
              ...(top ? { top: 0 } : { bottom: 0 }),
              ...(left ? { left: 0 } : { right: 0 }),
              borderColor: colors.primary,
              borderWidth: size * 0.16,
              borderRadius: size * 0.15,
              ...(!top ? { borderTopWidth: 0 } : { borderBottomWidth: 0 }),
              ...(!left ? { borderLeftWidth: 0 } : { borderRightWidth: 0 }),
            }}
          />
        );
      })}
    </View>
  );
}
export function Brand({ compact = false }: { compact?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel="Codexgram"
      style={{ flexDirection: "row", alignItems: "center", gap: 9 }}
    >
      <Aperture size={compact ? 25 : 32} />
      <Text
        style={{
          color: colors.text,
          fontSize: compact ? 23 : 29,
          fontWeight: "800",
          letterSpacing: -1.3,
        }}
      >
        codexgram
      </Text>
    </View>
  );
}
export function IconButton({
  icon,
  label,
  onPress,
  filled = false,
  disabled = false,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onPress: () => void;
  filled?: boolean;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: filled ? colors.primary : "transparent",
        opacity: disabled ? 0.5 : pressed ? 0.65 : 1,
      })}
    >
      <Feather
        name={icon}
        size={25}
        color={filled ? colors.onPrimary : colors.text}
      />
    </Pressable>
  );
}
