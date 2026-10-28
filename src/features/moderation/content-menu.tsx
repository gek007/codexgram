import React, { useState } from "react";
import { View, Text, Alert, Pressable } from "react-native";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Sheet } from "@/components/ui/sheet";
import { ActionRow } from "@/components/ui/action-row";
import { Illustration } from "@/components/ui/illustration";
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
  const [stage, setStage] = useState<"options" | "report" | "sent">("options");
  const [reportAccount, setReportAccount] = useState(target.type === "user");
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
  const close = onDone ?? (() => setStage("options"));
  const reasons = [
    "Harassment or bullying",
    "Hate or discrimination",
    "Sexual content",
    "Violence or threats",
    "Spam",
    "Something else",
  ];
  if (stage === "sent")
    return (
      <Sheet expanded title="Thanks for letting us know." onClose={close}>
        <View
          style={{
            alignItems: "center",
            paddingVertical: 64,
            gap: 24,
            flexGrow: 1,
          }}
        >
          <Illustration kind="report" size={200} />
          <Text
            style={{
              color: colors.muted,
              fontSize: 16,
              lineHeight: 24,
              textAlign: "center",
            }}
          >
            Your report has been sent for review.
          </Text>
        </View>
        <Button label="Done" onPress={close} />
      </Sheet>
    );
  if (stage === "report")
    return (
      <Sheet
        expanded
        title={reportAccount ? "Report account" : `Report ${target.type}`}
        onClose={close}
      >
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>
          What’s wrong with this {reportAccount ? "account" : target.type}?
        </Text>
        {reasons.map((choice) => (
          <Pressable
            key={choice}
            accessibilityRole="radio"
            accessibilityState={{ selected: reason === choice }}
            onPress={() => setReason(choice)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              minHeight: 52,
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: reason === choice ? colors.primary : colors.border,
              backgroundColor:
                reason === choice ? colors.secondary : colors.surface,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 1,
                borderColor: colors.primary,
                backgroundColor:
                  reason === choice ? colors.primary : "transparent",
              }}
            />
            <Text style={{ flex: 1, color: colors.text, fontSize: 15 }}>
              {choice}
            </Text>
          </Pressable>
        ))}
        {!!error && (
          <Text accessibilityRole="alert" style={{ color: colors.danger }}>
            {error}
          </Text>
        )}
        <Button
          label="Send report"
          disabled={!reason.trim()}
          loading={busy}
          onPress={() =>
            void run(async () => {
              await report({
                target: reportAccount ? { type: "user", id: authorId } : target,
                reason,
              });
              setStage("sent");
            }, "Report sent.")
          }
        />
        <Text
          style={{ color: colors.muted, fontSize: 13, textAlign: "center" }}
        >
          Reports are reviewed by the app’s admin team.
        </Text>
        <Button variant="soft" label="Cancel" onPress={close} />
      </Sheet>
    );
  return (
    <Sheet
      title={
        target.type === "user"
          ? "Account options"
          : `${target.type === "post" ? "Post" : "Comment"} options`
      }
      onClose={close}
    >
      <ActionRow
        icon="flag"
        label={
          target.type === "user" ? "Report account" : `Report ${target.type}`
        }
        onPress={() => {
          setReportAccount(target.type === "user");
          setStage("report");
        }}
      />
      {target.type !== "user" && (
        <ActionRow
          icon="user"
          label="Report this account"
          onPress={() => {
            setReportAccount(true);
            setStage("report");
          }}
        />
      )}
      {canModerate && (
        <Field
          label="Reason for removal"
          value={reason}
          onChangeText={setReason}
          maxLength={500}
        />
      )}
      <ActionRow
        icon="slash"
        danger
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
        <ActionRow
          icon="trash-2"
          danger
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
        <ActionRow
          icon="user-x"
          danger
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
      {onDone && <Button variant="soft" label="Cancel" onPress={onDone} />}
    </Sheet>
  );
}
