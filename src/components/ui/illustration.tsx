import React from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Aperture } from "./brand";
import { useTheme } from "@/theme/theme-provider";
export function Illustration({
  kind = "photo",
  size = 144,
}: {
  kind?:
    "mail" | "lock" | "key" | "success" | "photo" | "community" | "activity";
  size?: number;
}) {
  const { colors } = useTheme();
  const icons = {
    mail: "mail",
    lock: "lock",
    key: "key",
    success: "check",
    photo: "camera",
    community: "users",
    activity: "message-circle",
  } as const;
  return (
    <View
      accessible={false}
      style={{
        width: size,
        height: size,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 8,
      }}
    >
      <View
        style={{
          position: "absolute",
          width: size * 0.92,
          height: size * 0.72,
          borderRadius: size * 0.36,
          backgroundColor: colors.secondary,
          transform: [{ rotate: "-14deg" }],
        }}
      />
      {kind === "success" ? (
        <>
          <Aperture size={size * 0.6} />
          <View style={{ position: "absolute" }}>
            <Feather name="check" size={size * 0.32} color={colors.primary} />
          </View>
        </>
      ) : (
        <Feather name={icons[kind]} size={size * 0.48} color={colors.primary} />
      )}
      {[
        [-0.38, -0.25],
        [0.38, -0.1],
        [0.3, 0.3],
      ].map(([x, y], i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: 7,
            height: 18,
            borderRadius: 4,
            backgroundColor: i === 1 ? colors.primary : "#D8F36A",
            transform: [
              { translateX: x * size },
              { translateY: y * size },
              { rotate: `${i * 55 + 25}deg` },
            ],
          }}
        />
      ))}
    </View>
  );
}
