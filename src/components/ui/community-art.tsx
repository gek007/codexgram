import React from "react";
import { Image, type ImageStyle } from "expo-image";
import { type StyleProp } from "react-native";

export const communityAccents = ["#5B36E8", "#377C43", "#F58316", "#251044"];
const artwork = [
  require("../../../assets/design/community-violet.png"),
  require("../../../assets/design/community-green.png"),
  require("../../../assets/design/community-orange.png"),
  require("../../../assets/design/community-night.png"),
];
export function CommunityArt({
  accent,
  style,
  cover = false,
}: {
  accent: string;
  style?: StyleProp<ImageStyle>;
  cover?: boolean;
}) {
  const index = Math.max(
    0,
    communityAccents.findIndex(
      (color) => color.toLowerCase() === accent.toLowerCase(),
    ),
  );
  return (
    <Image
      accessibilityElementsHidden
      importantForAccessibility="no"
      source={
        cover && index === 0
          ? require("../../../assets/design/community-violet-cover.png")
          : artwork[index]
      }
      contentFit="cover"
      style={[{ aspectRatio: 1, borderRadius: 12 }, style]}
    />
  );
}
