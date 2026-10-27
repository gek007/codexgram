import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
import { makeRedirectUri } from "expo-auth-session";
import { router } from "expo-router";
import { Screen, Body } from "@/components/ui/screen";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useTheme } from "@/theme/theme-provider";
import { errorMessage } from "@/lib/errors";
import { completeSocialAuth } from "./social-flow";
export function AuthScreen({
  continuation = false,
}: {
  continuation?: boolean;
}) {
  const { colors } = useTheme();
  const { signIn, fetchStatus: inStatus } = useSignIn();
  const { signUp, fetchStatus: upStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const [mode, setMode] = useState<
    | "signin"
    | "signup"
    | "verify"
    | "trust"
    | "reset"
    | "resetcode"
    | "newpassword"
    | "continue"
  >(continuation ? "continue" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const busy = pending || inStatus === "fetching" || upStatus === "fetching";
  const check = (r: { error: unknown }) => {
    if (r.error) throw r.error;
  };
  const finish = async (kind: "in" | "up") => {
    const resource = kind === "in" ? signIn : signUp;
    check(
      await resource.finalize({
        navigate: async ({ session }) => {
          if (session?.currentTask) {
            setError(
              "Your account needs another verification step. Complete it before continuing.",
            );
            setMode("continue");
          } else router.replace("/");
        },
      }),
    );
  };
  const afterSignIn = async () => {
    if (signIn.status === "complete") {
      await finish("in");
      return;
    }
    if (
      signIn.status === "needs_client_trust" ||
      signIn.status === "needs_second_factor"
    ) {
      if (
        signIn.supportedSecondFactors?.some((f) => f.strategy === "email_code")
      ) {
        check(await signIn.mfa.sendEmailCode());
        setMode("trust");
      } else
        setError(
          "This account needs a verification method not enabled in this beta.",
        );
    } else setError("Please complete account verification to continue.");
  };
  const submit = async () => {
    setPending(true);
    setError("");
    try {
      if (mode === "signin") {
        check(await signIn.password({ emailAddress: email.trim(), password }));
        await afterSignIn();
      } else if (mode === "signup") {
        check(await signUp.password({ emailAddress: email.trim(), password }));
        if (signUp.status === "complete") await finish("up");
        else {
          check(await signUp.verifications.sendEmailCode());
          setMode("verify");
        }
      } else if (mode === "verify") {
        check(await signUp.verifications.verifyEmailCode({ code }));
        if (signUp.status === "complete") await finish("up");
        else
          setError(
            "Your account needs more information before you can continue.",
          );
      } else if (mode === "trust") {
        check(await signIn.mfa.verifyEmailCode({ code }));
        await afterSignIn();
      } else if (mode === "reset") {
        check(await signIn.create({ identifier: email.trim() }));
        check(await signIn.resetPasswordEmailCode.sendCode());
        setMode("resetcode");
      } else if (mode === "resetcode") {
        check(await signIn.resetPasswordEmailCode.verifyCode({ code }));
        setMode("newpassword");
      } else if (mode === "newpassword") {
        check(await signIn.resetPasswordEmailCode.submitPassword({ password }));
        await afterSignIn();
      } else {
        if (signUp.status === "complete") await finish("up");
        else if (signIn.status === "complete") await finish("in");
        else if (signUp.status === "missing_requirements") {
          check(await signUp.update({ emailAddress: email.trim() }));
          check(await signUp.verifications.sendEmailCode());
          setMode("verify");
        } else await afterSignIn();
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPending(false);
    }
  };
  const social = async (provider: "google" | "facebook") => {
    setPending(true);
    setError("");
    try {
      const state = await completeSocialAuth(() =>
        startSSOFlow({
          strategy: provider === "google" ? "oauth_google" : "oauth_facebook",
          redirectUrl: makeRedirectUri({
            scheme: "codexgram",
            path: "continue",
          }),
        }),
      );
      if (state === "continue") setMode("continue");
      else if (state === "complete") router.replace("/");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPending(false);
    }
  };
  const codeMode = ["verify", "trust", "resetcode"].includes(mode);
  const emailMode = ["signin", "signup", "reset", "continue"].includes(mode);
  const passwordMode = ["signin", "signup", "newpassword"].includes(mode);
  return (
    <Screen
      title="Codexgram"
      subtitle="Find your people. Share your perspective."
    >
      <View
        style={{
          height: 116,
          backgroundColor: colors.secondary,
          borderRadius: 28,
          padding: 24,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Text style={{ fontSize: 52 }}>✳</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "800", fontSize: 22, color: colors.text }}>
            Your kind of community.
          </Text>
          <Text style={{ color: colors.muted, marginTop: 5 }}>
            One photo. A new connection.
          </Text>
        </View>
      </View>
      <Text
        accessibilityRole="header"
        style={{ fontSize: 24, fontWeight: "800", color: colors.text }}
      >
        {mode === "signup"
          ? "Make yourself at home"
          : codeMode
            ? "Check your email"
            : mode === "newpassword"
              ? "Choose a new password"
              : mode === "reset"
                ? "Reset your password"
                : mode === "continue"
                  ? "Finish signing in"
                  : "Welcome back"}
      </Text>
      {emailMode && (
        <Field
          label="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      )}
      {passwordMode && (
        <Field
          label={mode === "newpassword" ? "New password" : "Password"}
          secureTextEntry
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChangeText={setPassword}
        />
      )}
      {codeMode && (
        <Field
          label="Verification code"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          value={code}
          onChangeText={setCode}
        />
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <Button
        label={
          codeMode
            ? "Verify"
            : mode === "signup"
              ? "Create account"
              : mode === "reset"
                ? "Send reset code"
                : mode === "newpassword"
                  ? "Save password"
                  : "Continue"
        }
        onPress={() => void submit()}
        loading={busy}
      />
      {codeMode && (
        <Button
          secondary
          label="Resend code"
          disabled={busy}
          onPress={() => {
            setError("");
            void (
              mode === "verify"
                ? signUp.verifications.sendEmailCode()
                : mode === "trust"
                  ? signIn.mfa.sendEmailCode()
                  : signIn.resetPasswordEmailCode.sendCode()
            )
              .then(check)
              .catch((e) => setError(errorMessage(e)));
          }}
        />
      )}
      {["signin", "signup"].includes(mode) && (
        <>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button
                secondary
                label="Google"
                disabled={busy}
                onPress={() => void social("google")}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                secondary
                label="Facebook"
                disabled={busy}
                onPress={() => void social("facebook")}
              />
            </View>
          </View>
          <Button
            secondary
            label={
              mode === "signup"
                ? "Already have an account? Sign in"
                : "New here? Create an account"
            }
            disabled={busy}
            onPress={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError("");
            }}
          />
        </>
      )}
      {mode === "signin" ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setMode("reset")}
          style={{ padding: 12 }}
        >
          <Text
            style={{
              textAlign: "center",
              color: colors.primary,
              fontWeight: "600",
            }}
          >
            Forgot password?
          </Text>
        </Pressable>
      ) : (
        <Button
          secondary
          label="Back to sign in"
          disabled={busy}
          onPress={() => {
            signIn.reset();
            signUp.reset();
            setMode("signin");
            setError("");
            setCode("");
          }}
        />
      )}
      <View nativeID="clerk-captcha" />
      <Body>Share what you love, with people who get it.</Body>
    </Screen>
  );
}
