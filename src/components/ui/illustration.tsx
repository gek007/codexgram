import React from "react";
import { Image } from "expo-image";

const artwork = {
  mail: require("../../../assets/design/mail.png"),
  lock: require("../../../assets/design/lock.png"),
  key: require("../../../assets/design/key.png"),
  success: require("../../../assets/design/community-success.png"),
  photo: require("../../../assets/design/feed-empty.png"),
  community: require("../../../assets/design/community-success.png"),
  activity: require("../../../assets/design/conversation-empty.png"),
  providers: require("../../../assets/design/providers.png"),
  report: require("../../../assets/design/report-success.png"),
};

/** Decorative artwork extracted from the approved screen boards. */
export function Illustration({
  kind = "photo",
  size = 180,
}: {
  kind?: keyof typeof artwork;
  size?: number;
}) {
  return (
    <Image
      source={artwork[kind]}
      contentFit="contain"
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        width: size,
        height: size * 0.78,
        alignSelf: "center",
        marginVertical: 16,
      }}
    />
  );
}
