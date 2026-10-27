import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { useTheme } from "@/theme/theme-provider";
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 7 }}>
      <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...props}
        style={[
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            padding: 15,
            fontSize: 16,
            minHeight: 50,
          },
          props.style,
        ]}
      />
    </View>
  );
}
