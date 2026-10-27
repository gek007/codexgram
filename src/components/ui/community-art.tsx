import React from "react";
import { Image } from "expo-image";
import { type StyleProp } from "react-native";

export const communityAccents = ["#5B36E8", "#377C43", "#F58316", "#251044"];
/** Local vector covers use the community's chosen color, without remote images. */
export function CommunityArt({
  accent,
  style,
}: {
  accent: string;
  style?: StyleProp<import("expo-image").ImageStyle>;
}) {
  const index = Math.max(
    0,
    communityAccents.indexOf(
      accent.toUpperCase() === "#5B36E8" ? "#5B36E8" : accent,
    ),
  );
  const forms = [
    `<g fill="${accent}">${Array.from({ length: 12 }, (_, n) => `<path d="M100 7 L110 49 L90 49 Z" transform="rotate(${n * 30} 100 100)"/>`).join("")}<circle cx="100" cy="100" r="43"/></g><circle cx="100" cy="100" r="51" fill="none" stroke="${accent}" stroke-width="3"/>`,
    `<path d="M21 200 Q-5 63 50 10 Q81 92 62 200" fill="#246D43"/><path d="M42 200 Q34 58 159 20 Q168 131 42 200" fill="#6EAF68"/><path d="M44 200 Q73 78 202 85 Q166 179 44 200" fill="#278050"/><path d="M43 200 L151 45 M43 200 L185 100 M43 200 L50 26" stroke="#B9D68E" stroke-width="2"/>`,
    `<circle cx="20" cy="90" r="65" fill="#F27100"/><path d="M20 180 L180 20 L180 180 Z" fill="#FF9E35"/><path d="M74 180 L180 74 L180 180 Z" fill="#EC6500"/><circle cx="192" cy="194" r="45" fill="#FFBC62"/>`,
    `<circle cx="91" cy="100" r="77" fill="#6A429E"/><circle cx="123" cy="81" r="79" fill="#251044"/><circle cx="133" cy="114" r="40" fill="#B8A0E5"/>`,
  ];
  const backgrounds = ["#E3D9FF", "#D3E8AE", "#FFC575", "#251044"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="${backgrounds[index]}"/>${forms[index]}</svg>`;
  return (
    <Image
      accessibilityElementsHidden
      importantForAccessibility="no"
      source={{ uri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` }}
      contentFit="cover"
      style={[{ aspectRatio: 1, borderRadius: 12 }, style]}
    />
  );
}
