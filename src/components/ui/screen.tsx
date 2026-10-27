import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { type, spacing } from "@/theme/design";
import { useTheme } from "@/theme/theme-provider";
export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
  insetTop = true,
  insetBottom = true,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  insetTop?: boolean;
  insetBottom?: boolean;
}) {
  const { colors } = useTheme();
  const content = (
    <View
      style={{
        padding: spacing.page,
        gap: spacing.control,
        flexGrow: 1,
        ...(!scroll ? { flex: 1 } : {}),
        width: "100%",
        maxWidth: 640,
        alignSelf: "center",
      }}
    >
      {title && (
        <View style={{ gap: 8 }}>
          <Text
            accessibilityRole="header"
            style={{
              ...type.display,
              color: colors.text,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={{ fontSize: 16, lineHeight: 24, color: colors.muted }}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
  return (
    <SafeAreaView
      edges={[
        ...(insetTop ? ["top" as const] : []),
        "left",
        "right",
        ...(insetBottom ? ["bottom" as const] : []),
      ]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Body({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text style={{ fontSize: 16, lineHeight: 24, color: colors.text }}>
      {children}
    </Text>
  );
}
