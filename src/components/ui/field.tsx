import React, { useState } from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/theme-provider";
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  return (
    <View style={{ gap: 7 }}>
      <Text style={{ color: colors.text, fontWeight: "500", fontSize: 14 }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: focused ? colors.primary : colors.border,
          borderRadius: 12,
        }}
      >
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.muted}
          {...props}
          secureTextEntry={!!props.secureTextEntry && !revealed}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            {
              color: colors.text,
              flex: 1,
              padding: 14,
              fontSize: 16,
              minHeight: 50,
              ...(props.multiline
                ? { minHeight: 110, textAlignVertical: "top" }
                : {}),
            },
            props.style,
          ]}
        />
        {props.secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
            onPress={() => setRevealed(!revealed)}
            style={{
              minWidth: 44,
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather
              name={revealed ? "eye-off" : "eye"}
              color={colors.muted}
              size={21}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}
