import React, { useRef, useState } from "react";
import { View, Text, Alert, TextInput } from "react-native";
import { randomUUID } from "expo-crypto";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Feather } from "@expo/vector-icons";
import { ActionRow } from "@/components/ui/action-row";
import { Illustration } from "@/components/ui/illustration";
import { IconButton } from "@/components/ui/brand";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ContentMenu } from "@/features/moderation/content-menu";
import { useTheme } from "@/theme/theme-provider";
import { errorMessage } from "@/lib/errors";
export function CommentList({
  postId,
  communityId,
}: {
  postId: Id<"posts">;
  communityId: Id<"communities">;
}) {
  const { colors } = useTheme();
  const { results, status, loadMore } = usePaginatedQuery(
    api.comments.list,
    { postId },
    { initialNumItems: 20 },
  );
  const create = useMutation(api.comments.create);
  const update = useMutation(api.comments.update);
  const remove = useMutation(api.comments.remove);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editText, setEditText] = useState("");
  const [menu, setMenu] = useState<Id<"comments"> | null>(null);
  const request = useRef(randomUUID());
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: 16 }}>
      <Text
        accessibilityRole="header"
        style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}
      >
        Comments
      </Text>
      {results.map((c) => (
        <View
          key={c.id}
          style={{
            borderBottomWidth: 1,
            borderColor: colors.border,
            paddingBottom: 14,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: colors.secondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.primary, fontWeight: "700" }}>
                {c.username[0]?.toUpperCase()}
              </Text>
            </View>
            <Text style={{ flex: 1, fontWeight: "700", color: colors.text }}>
              @{c.username}
              {c.editedAt ? " · Edited" : ""}
            </Text>
            <IconButton
              icon="more-horizontal"
              label={`Options for ${c.username}'s comment`}
              onPress={() => {
                setMenu(c.id);
                setEditText(c.text);
              }}
            />
          </View>
          <Text style={{ color: colors.text, lineHeight: 22, paddingLeft: 48 }}>
            {c.text}
          </Text>
          {menu === c.id &&
            (c.canEdit ? (
              <Sheet title="Your comment" onClose={() => setMenu(null)}>
                <Field
                  label="Edit comment"
                  value={editText}
                  onChangeText={setEditText}
                  maxLength={1000}
                  multiline
                />
                <Button
                  label="Save changes"
                  loading={busy}
                  disabled={!editText.trim()}
                  onPress={() =>
                    void run(async () => {
                      await update({ commentId: c.id, text: editText });
                      setMenu(null);
                    })
                  }
                />
                <ActionRow
                  icon="trash-2"
                  danger
                  label="Delete comment"
                  disabled={busy}
                  onPress={() =>
                    Alert.alert(
                      "Delete comment?",
                      "This removes your comment.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () =>
                            void run(async () => {
                              await remove({ commentId: c.id });
                              setMenu(null);
                            }),
                        },
                      ],
                    )
                  }
                />
                {!!error && (
                  <Text
                    accessibilityRole="alert"
                    style={{ color: colors.danger }}
                  >
                    {error}
                  </Text>
                )}
                <Button
                  variant="soft"
                  label="Cancel"
                  onPress={() => setMenu(null)}
                />
              </Sheet>
            ) : (
              <ContentMenu
                target={{ type: "comment", id: c.id }}
                authorId={c.authorId}
                communityId={communityId}
                canModerate={c.canModerate}
                onDone={() => setMenu(null)}
              />
            ))}
        </View>
      ))}
      {status === "Exhausted" && !results.length && (
        <View style={{ paddingVertical: 20, gap: 6, alignItems: "center" }}>
          <Illustration kind="activity" size={72} />
          <Text style={{ color: colors.text, fontWeight: "700" }}>
            Start the conversation
          </Text>
          <Text style={{ color: colors.muted }}>Be the first to comment.</Text>
        </View>
      )}
      {status === "CanLoadMore" && (
        <Button secondary label="More comments" onPress={() => loadMore(20)} />
      )}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
          backgroundColor: colors.surface,
          borderRadius: 28,
          borderWidth: 1,
          borderColor: colors.border,
          paddingLeft: 16,
          paddingRight: 4,
        }}
      >
        <TextInput
          accessibilityLabel="Add a comment"
          value={text}
          maxLength={1000}
          editable={!busy}
          onChangeText={setText}
          placeholder="Add a comment…"
          placeholderTextColor={colors.muted}
          multiline
          style={{
            flex: 1,
            minHeight: 48,
            maxHeight: 132,
            color: colors.text,
            fontSize: 16,
            paddingVertical: 12,
          }}
        />
        <Button
          iconOnly
          label="Post comment"
          loading={busy}
          disabled={!text.trim()}
          icon={<Feather name="arrow-up" size={20} color={colors.onPrimary} />}
          onPress={() =>
            void run(async () => {
              await create({ postId, text, requestId: request.current });
              setText("");
              request.current = randomUUID();
            })
          }
        />
      </View>
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
    </View>
  );
}
