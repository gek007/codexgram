import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useTheme } from "@/theme/theme-provider";

/** One native input preserves paste, autofill and screen-reader editing across six visual cells. */
export function CodeField({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (value: string) => void;
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ minHeight: 64, marginVertical: 12 }}>
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ flexDirection: "row", gap: 6 }}
      >
        {Array.from({ length: 6 }, (_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 58,
              borderRadius: 9,
              borderWidth: 1,
              borderColor:
                focused && index === Math.min(value.length, 5)
                  ? colors.primary
                  : colors.border,
              backgroundColor: colors.surface,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.text, fontSize: 25 }}>
              {value[index] ?? ""}
            </Text>
          </View>
        ))}
      </View>
      <TextInput
        accessibilityLabel="Verification code"
        value={value}
        onChangeText={(text) =>
          onChangeText(text.replace(/\D/g, "").slice(0, 6))
        }
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        caretHidden
        style={{
          position: "absolute",
          width: "100%",
          height: 58,
          color: "transparent",
          backgroundColor: "transparent",
        }}
      />
    </View>
  );
}
