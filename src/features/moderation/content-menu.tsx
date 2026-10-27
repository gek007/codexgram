import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { errorMessage } from "@/lib/errors";
import { useTheme } from "@/theme/theme-provider";
type Target =
  | { type: "post"; id: Id<"posts"> }
  | { type: "comment"; id: Id<"comments"> }
  | { type: "user"; id: Id<"users"> };
export function ContentMenu({
  target,
  authorId,
  communityId,
  canModerate = false,
  onDone,
}: {
  target: Target;
  authorId: Id<"users">;
  communityId?: Id<"communities">;
  canModerate?: boolean;
  onDone?: () => void;
}) {
  const { colors } = useTheme();
  const report = useMutation(api.moderation.report);
  const block = useMutation(api.moderation.block);
  const ban = useMutation(api.moderation.ban);
  const remove = useMutation(api.moderation.removeContent);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      setMessage(success);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <View
      style={{
        backgroundColor: colors.secondary,
        padding: 16,
        borderRadius: 20,
        gap: 10,
      }}
    >
      <Field
        label="Reason for report or removal"
        value={reason}
        onChangeText={setReason}
        maxLength={500}
        multiline
      />
      <Button
        secondary
        label="Report content"
        disabled={busy || !reason.trim()}
        onPress={() =>
          void run(
            () => report({ target, reason }),
            "Report sent to the app admins.",
          )
        }
      />
      <Button
        secondary
        label="Report this account"
        disabled={busy || !reason.trim()}
        onPress={() =>
          void run(
            () => report({ target: { type: "user", id: authorId }, reason }),
            "Account reported.",
          )
        }
      />
      <Button
        secondary
        label="Block this account"
        disabled={busy}
        onPress={() =>
          Alert.alert(
            "Block this account?",
            "You will no longer see each other’s content or interact.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Block",
                style: "destructive",
                onPress: () =>
                  void run(
                    () => block({ userId: authorId }),
                    "Account blocked.",
                  ),
              },
            ],
          )
        }
      />
      {canModerate && target.type !== "user" && (
        <Button
          secondary
          label="Remove content"
          disabled={busy || !reason.trim()}
          onPress={() =>
            Alert.alert(
              "Remove this content?",
              "It will no longer appear in the community.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: () =>
                    void run(
                      () => remove({ target, reason }),
                      "Content removed.",
                    ),
                },
              ],
            )
          }
        />
      )}
      {canModerate && communityId && (
        <Button
          secondary
          label="Ban author from community"
          disabled={busy}
          onPress={() =>
            Alert.alert(
              "Ban this member?",
              "They can still browse, but cannot join, post, like or comment here.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Ban member",
                  style: "destructive",
                  onPress: () =>
                    void run(
                      () => ban({ communityId, userId: authorId }),
                      "Member banned.",
                    ),
                },
              ],
            )
          }
        />
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      {!!message && <Text style={{ color: colors.text }}>{message}</Text>}
      {onDone && <Button secondary label="Close" onPress={onDone} />}
    </View>
  );
}
