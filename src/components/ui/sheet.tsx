import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "@/theme/theme-provider";
export function Sheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.45)",
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss options"
          onPress={onClose}
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
        />
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: "90%",
            width: "100%",
            maxWidth: 640,
            alignSelf: "center",
            paddingBottom: 28,
          }}
        >
          <View
            style={{
              width: 40,
              height: 5,
              backgroundColor: colors.border,
              borderRadius: 3,
              alignSelf: "center",
              marginTop: 10,
              marginBottom: 20,
            }}
          />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
          >
            <Text
              accessibilityRole="header"
              style={{ fontSize: 23, fontWeight: "700", color: colors.text }}
            >
              {title}
            </Text>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
