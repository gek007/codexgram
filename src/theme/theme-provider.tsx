import React, { createContext, useContext, useSyncExternalStore } from "react";
import { useColorScheme } from "react-native";

const light = {
  background: "#FAF9F6",
  surface: "#FFFFFF",
  text: "#202024",
  muted: "#686870",
  border: "#E3E1E8",
  primary: "#5B36E8",
  onPrimary: "#FFFFFF",
  secondary: "#EEE9FF",
  coral: "#FF7864",
  teal: "#237A50",
  danger: "#B63C45",
};
const dark = {
  background: "#151419",
  surface: "#232128",
  text: "#F6F4FA",
  muted: "#B9B5C4",
  border: "#3C374E",
  primary: "#B5A0FF",
  onPrimary: "#20163A",
  secondary: "#3B2C57",
  coral: "#FF9A89",
  teal: "#7DDBCC",
  danger: "#FF9BAB",
};
const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
type Theme = { colors: typeof light; dark: boolean };
const Context = createContext<Theme>({ colors: light, dark: false });
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    clientSnapshot,
    serverSnapshot,
  );
  const isDark = hydrated && scheme === "dark";
  return (
    <Context.Provider value={{ colors: isDark ? dark : light, dark: isDark }}>
      {children}
    </Context.Provider>
  );
}
export const useTheme = () => useContext(Context);
