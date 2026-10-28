import React from "react";
import { createRoot } from "react-dom/client";
import { View, Text } from "react-native-web";
import { ThemeProvider } from "@/theme/theme-provider";
import { HomeScreen } from "@/features/feed/feed-screen";
import { CommunityScreen } from "@/features/communities/community-screen";
import { DirectoryScreen } from "@/features/communities/directory-screen";
import { CreateCommunityScreen } from "@/features/communities/create-community-screen";
import { ProfileScreen } from "@/features/profiles/profile-screen";
import { AccountSettingsScreen } from "@/features/profiles/account-settings-screen";
import { NotificationsScreen } from "@/features/notifications/notifications-screen";
import { AuthScreen } from "@/features/auth/auth-screen";
import { ComposerScreen } from "@/features/posts/composer-screen";
import Reports from "@/app/admin/reports";
import Blocked from "@/app/settings/blocked";
import Post from "@/app/post/[postId]";
import Username from "@/app/(onboarding)/username";
import { ContentMenu } from "@/features/moderation/content-menu";
import { PhotoEditor } from "@/features/posts/photo-editor";
import { PhotoSourceSheet } from "@/components/ui/photo-source-sheet";
import { Feather, scenario } from "./mocks";
const screens = {
  creator: <CommunityScreen communityId="community1" />,
  publishing: <ComposerScreen communityId="community1" />,
  "edit-post": <ComposerScreen postId="post0" />,
  "empty-home": <HomeScreen />,
  "empty-activity": <NotificationsScreen />,
  "empty-profile": <ProfileScreen userId="user1" />,
  retry: <ComposerScreen communityId="community1" />,
  loading: <CommunityScreen communityId="community1" />,
  unavailable: <CommunityScreen communityId="community1" />,
  reports: <Reports />,
  blocked: <Blocked />,
  post: <Post />,
  username: <Username />,
  report: (
    <ContentMenu
      target={{ type: "post", id: "post0" }}
      authorId="user2"
      onDone={() => {}}
    />
  ),
  continue: <AuthScreen continuation />,
  home: <HomeScreen />,
  community: <CommunityScreen communityId="community1" />,
  preview: <CommunityScreen communityId="community1" />,
  discover: <DirectoryScreen />,
  onboarding: <DirectoryScreen onboarding />,
  create: <CreateCommunityScreen />,
  profile: <ProfileScreen userId="user1" />,
  "public-profile": <ProfileScreen userId="user1" insetTop={false} />,
  settings: <AccountSettingsScreen />,
  "edit-profile": <AccountSettingsScreen editing />,
  activity: <NotificationsScreen />,
  auth: <AuthScreen />,
  compose: <ComposerScreen communityId="community1" />,
  crop: (
    <PhotoEditor
      photo={{ uri: "/fixtures/coffee.png", width: 1200, height: 900 }}
      onDone={() => {}}
      onCancel={() => {}}
    />
  ),
  source: <PhotoSourceSheet onSelect={() => {}} onClose={() => {}} />,
};
const tabs = ["home", "discover", "profile", "activity"].includes(scenario);
const titles = {
  reports: "Report inbox",
  blocked: "Blocked accounts",
  post: "Post",
  username: "",
  settings: "Settings",
  "edit-profile": "Edit profile",
  create: "",
  compose: "New post",
  "public-profile": "Profile",
};
createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <View style={{ height: "100%", backgroundColor: "#FAF9F6" }}>
      {scenario in titles && (
        <View
          nativeID="fixture-header"
          style={{
            paddingTop: 44,
            height: 96,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <Feather name="chevron-left" size={24} />
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              marginRight: 24,
              fontWeight: "600",
              fontSize: 17,
            }}
          >
            {titles[scenario]}
          </Text>
        </View>
      )}
      {screens[scenario] ?? screens.home}
      {tabs && (
        <View
          style={{
            height: 76,
            flexDirection: "row",
            backgroundColor: "white",
            borderTopWidth: 1,
            borderColor: "#E3E1E8",
            paddingTop: 10,
          }}
        >
          {["Home", "Discover", "Activity", "You"].map((label, i) => (
            <View key={label} style={{ flex: 1, alignItems: "center", gap: 4 }}>
              <Feather
                name={["home", "compass", "bell", "user"][i]}
                size={24}
                color="#686670"
              />
              <Text style={{ fontSize: 12, color: "#686670" }}>{label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  </ThemeProvider>,
);
