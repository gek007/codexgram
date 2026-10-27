import React, { useRef, useState } from "react";
import { View, Text, Alert } from "react-native";
import { randomUUID } from "expo-crypto";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
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
  const [editing, setEditing] = useState<Id<"comments"> | null>(null);
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
        style={{ color: colors.text, fontSize: 23, fontWeight: "800" }}
      >
        The conversation
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
          <Text style={{ fontWeight: "700", color: colors.text }}>
            @{c.username}
            {c.editedAt ? " · edited" : ""}
          </Text>
          {editing === c.id ? (
            <>
              <Field
                label="Edit comment"
                value={editText}
                onChangeText={setEditText}
                maxLength={1000}
              />
              <Button
                secondary
                label="Save comment"
                loading={busy}
                onPress={() =>
                  void run(async () => {
                    await update({ commentId: c.id, text: editText });
                    setEditing(null);
                  })
                }
              />
              <Button
                secondary
                label="Cancel edit"
                onPress={() => setEditing(null)}
              />
            </>
          ) : (
            <Text style={{ color: colors.text, lineHeight: 22 }}>{c.text}</Text>
          )}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {c.canEdit ? (
              <>
                <Button
                  secondary
                  label="Edit"
                  disabled={busy}
                  onPress={() => {
                    setEditing(c.id);
                    setEditText(c.text);
                  }}
                />
                <Button
                  secondary
                  label="Delete"
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
                            void run(() => remove({ commentId: c.id })),
                        },
                      ],
                    )
                  }
                />
              </>
            ) : (
              <Button
                secondary
                label="Options"
                onPress={() => setMenu(menu === c.id ? null : c.id)}
              />
            )}
          </View>
          {menu === c.id && (
            <ContentMenu
              target={{ type: "comment", id: c.id }}
              authorId={c.authorId}
              communityId={communityId}
              canModerate={c.canModerate}
              onDone={() => setMenu(null)}
            />
          )}
        </View>
      ))}
      {status === "CanLoadMore" && (
        <Button secondary label="More comments" onPress={() => loadMore(20)} />
      )}
      <Field
        label="Add a comment"
        multiline
        value={text}
        maxLength={1000}
        editable={!busy}
        onChangeText={setText}
        placeholder="Keep the conversation going…"
      />
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <Button
        label="Post comment"
        loading={busy}
        disabled={!text.trim()}
        onPress={() =>
          void run(async () => {
            await create({ postId, text, requestId: request.current });
            setText("");
            request.current = randomUUID();
          })
        }
      />
    </View>
  );
}
