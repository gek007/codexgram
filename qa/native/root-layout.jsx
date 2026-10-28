import React, { useState, useEffect } from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import ActualRootLayout from "../../src/app/_layout";
import { chooseScenario, assetsReady, useFixture } from "./services";
import { resetDraft } from "./drafts";
const screens = [
  ["Welcome / authentication", "auth", "/(auth)/sign-in"],
  ["Complete social sign-in", "continue", "/continue"],
  ["Choose username", "onboarding-username", "/(onboarding)/username"],
  ["Choose communities", "onboarding-communities", "/(onboarding)/communities"],
  ["Home feed", "home", "/(tabs)"],
  ["Discover communities", "discover", "/(tabs)/discover"],
  ["Community + creator tools", "community", "/community/qa-community"],
  ["Create community", "create", "/community/create"],
  ["Photo post + comments", "post", "/post/qa-post0"],
  ["My post options", "own-post", "/post/qa-post1"],
  ["Public profile", "public-profile", "/user/qa-other"],
  ["My profile", "profile", "/(tabs)/profile"],
  ["Edit profile", "edit-profile", "/settings/profile"],
  ["Activity", "activity", "/(tabs)/notifications"],
  ["Settings", "settings", "/settings"],
  ["Blocked accounts", "blocked", "/settings/blocked"],
  ["Admin reports", "reports", "/admin/reports"],
  ["Admin access denied", "admin-denied", "/admin/reports"],
  ["New post / source / crop", "compose-empty", "/compose"],
  ["Photo composer", "compose", "/compose"],
  ["Edit post", "edit-post", "/post/edit/qa-post1"],
  ["Upload error / retry", "upload-error", "/compose"],
  ["Empty home", "empty-home", "/(tabs)"],
  ["Empty activity", "empty-activity", "/(tabs)/notifications"],
  ["Empty profile", "empty-profile", "/(tabs)/profile"],
  ["Empty blocked accounts", "empty-blocked", "/settings/blocked"],
  ["Empty reports", "empty-reports", "/admin/reports"],
  ["Unavailable community", "community-unavailable", "/community/qa-community"],
  ["Loading community", "community-loading", "/community/qa-community"],
  ["Loading feed", "feed-loading", "/(tabs)"],
  ["Account unavailable", "account-unavailable", "/"],
];
export default function NativeQARoot() {
  const state = useFixture();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void assetsReady.finally(() => setReady(true));
  }, []);
  const launch = ([, scenario, path]) => {
    resetDraft();
    chooseScenario(scenario);
    setOpen(false);
    // Let the real protected stack redirect when the account is suspended.
    // A competing replace while it removes protected screens can race navigation.
    if (scenario !== "account-unavailable")
      setTimeout(() => router.replace(path), 0);
  };
  return (
    <>
      <ActualRootLayout />
      <Pressable
        accessibilityRole="button"
        disabled={!ready}
        accessibilityLabel="Next native QA scenario"
        onPress={() =>
          launch(
            screens[
              (screens.findIndex((s) => s[1] === state.scenario) + 1) %
                screens.length
            ],
          )
        }
        style={{
          position: "absolute",
          right: 154,
          bottom: 96,
          backgroundColor: "#D7F371",
          borderRadius: 18,
          padding: 12,
          zIndex: 999,
          elevation: 999,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "700" }}>
          NEXT QA → {screens.findIndex((s) => s[1] === state.scenario) + 1}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open native QA scenarios"
        onPress={() => setOpen(true)}
        style={{
          position: "absolute",
          right: 12,
          bottom: 96,
          backgroundColor: "#1D1830",
          borderRadius: 18,
          padding: 12,
          zIndex: 999,
          elevation: 999,
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "700" }}>
          QA · {state.scenario}
        </Text>
      </Pressable>
      <Modal
        visible={open}
        onRequestClose={() => setOpen(false)}
        animationType="slide"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#FAF9F6",
            paddingTop: 40,
            paddingHorizontal: 20,
            paddingBottom: 24,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>
            Native QA scenarios
          </Text>
          <Text style={{ marginBottom: 12 }}>
            Local fake data · No live account or database
          </Text>
          <ScrollView>
            {screens.map(([label, scenario, path]) => (
              <Pressable
                key={scenario}
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={() => {
                  resetDraft();
                  chooseScenario(scenario);
                  setOpen(false);
                  // Let the real protected stack redirect when the account is suspended.
    // A competing replace while it removes protected screens can race navigation.
    if (scenario !== "account-unavailable")
      setTimeout(() => router.replace(path), 0);
                }}
                style={{
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderColor: "#DDD",
                }}
              >
                <Text style={{ fontSize: 16 }}>{label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable onPress={() => setOpen(false)} style={{ padding: 14 }}>
            <Text>Close scenarios · {state.scenario}</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
