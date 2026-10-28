import React from "react";
import { Image } from "expo-image";
const marks = {
  google: require("../../../assets/images/google-mark.svg"),
  facebook: require("../../../assets/images/facebook-mark.svg"),
};
/** File assets avoid the platform-specific decoding of inline SVG data URLs. */
export function ProviderMark({
  provider,
}: {
  provider: "google" | "facebook";
}) {
  return (
    <Image
      accessible={false}
      source={marks[provider]}
      contentFit="contain"
      style={{ width: 24, height: 24 }}
    />
  );
}
