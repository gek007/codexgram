import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
import { makeRedirectUri } from "expo-auth-session";
import { router } from "expo-router";
import { Brand, IconButton } from "@/components/ui/brand";
import { Image } from "expo-image";
import { Illustration } from "@/components/ui/illustration";
import { ProviderMark } from "@/components/ui/provider-mark";
import { Screen } from "@/components/ui/screen";
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
    | "welcome"
    | "signin"
    | "signup"
    | "verify"
    | "trust"
    | "reset"
    | "resetcode"
    | "newpassword"
    | "continue"
  >(continuation ? "continue" : "welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (mode === "newpassword" && password !== confirmPassword) {
      setError("Passwords don’t match.");
      return;
    }
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
  if (mode === "welcome")
    return (
      <Screen>
        <View style={{ gap: 12, flexGrow: 1 }}>
          <Text
            accessibilityRole="header"
            style={{
              color: colors.text,
              fontSize: 34,
              lineHeight: 39,
              fontWeight: "800",
              letterSpacing: -1.4,
            }}
          >
            Find your people. Share your perspective.
          </Text>
          <Text style={{ color: colors.muted, fontSize: 16, lineHeight: 24 }}>
            A place for everyday photos and real connections.
          </Text>
          <Image
            accessible={false}
            source={require("../../../assets/images/welcome-collage.png")}
            contentFit="contain"
            style={{
              width: "100%",
              aspectRatio: 1.1,
              maxHeight: 310,
              marginVertical: 4,
            }}
          />
          <Button label="Get started" onPress={() => setMode("signup")} />
          <Button
            secondary
            label="I have an account"
            onPress={() => setMode("signin")}
          />
          <Text
            style={{
              color: colors.muted,
              textAlign: "center",
              fontSize: 12,
              lineHeight: 18,
              marginTop: 4,
            }}
          >
            Photos bring us together.
          </Text>
        </View>
      </Screen>
    );
  const title =
    mode === "signup"
      ? "Make room for your perspective."
      : codeMode
        ? "Check your inbox"
        : mode === "newpassword"
          ? "Choose a new password"
          : mode === "reset"
            ? "Let’s get you back in."
            : mode === "continue"
              ? "One more thing"
              : "Good to see you.";
  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <IconButton
          icon="chevron-left"
          label="Back to welcome"
          onPress={() => {
            setMode("welcome");
            setError("");
          }}
        />
        {!["signin", "signup"].includes(mode) && <Brand compact />}
      </View>
      {!["signin", "signup"].includes(mode) && (
        <Illustration
          kind={
            codeMode
              ? "mail"
              : mode === "newpassword"
                ? "key"
                : mode === "reset"
                  ? "lock"
                  : "success"
          }
          size={132}
        />
      )}
      <View
        style={{
          gap: 8,
          paddingTop: ["signin", "signup"].includes(mode) ? 12 : 0,
          paddingBottom: 8,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{
            color: colors.text,
            fontSize: 28,
            lineHeight: 34,
            fontWeight: "700",
            letterSpacing: -1,
          }}
        >
          {title}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 16, lineHeight: 24 }}>
          {mode === "signup"
            ? "Create your Codexgram account."
            : codeMode
              ? `Enter the code sent to ${email || "your email"}.`
              : mode === "reset"
                ? "Enter your email and we’ll send you a code to reset your password."
                : mode === "continue"
                  ? "Add and verify your email to finish setting up your account."
                  : mode === "newpassword"
                    ? "Create a new password for your account."
                    : "Sign in to your Codexgram account."}
        </Text>
      </View>
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
      {mode === "newpassword" && (
        <Field
          label="Confirm password"
          secureTextEntry
          autoComplete="new-password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      )}
      {mode === "signup" && (
        <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
          Use at least 8 characters.
        </Text>
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
      {mode === "signin" && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setMode("reset")}
          style={{ padding: 12, minHeight: 44, justifyContent: "center" }}
        >
          <Text
            style={{
              textAlign: "right",
              color: colors.primary,
              fontWeight: "600",
            }}
          >
            Forgot password?
          </Text>
        </Pressable>
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
                  : mode === "signin"
                    ? "Sign in"
                    : "Continue"
        }
        onPress={() => void submit()}
        loading={busy}
      />
      {codeMode && (
        <Button
          variant="tertiary"
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              paddingVertical: 4,
            }}
          >
            <View
              style={{ flex: 1, height: 1, backgroundColor: colors.border }}
            />
            <Text style={{ color: colors.muted }}>or</Text>
            <View
              style={{ flex: 1, height: 1, backgroundColor: colors.border }}
            />
          </View>
          <Button
            variant="provider"
            icon={<ProviderMark provider="google" />}
            label="Continue with Google"
            disabled={busy}
            onPress={() => void social("google")}
          />
          <Button
            variant="provider"
            icon={<ProviderMark provider="facebook" />}
            label="Continue with Facebook"
            disabled={busy}
            onPress={() => void social("facebook")}
          />
          <Button
            variant="tertiary"
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
      {!["signin", "signup"].includes(mode) && (
        <Button
          variant="tertiary"
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
    </Screen>
  );
}
