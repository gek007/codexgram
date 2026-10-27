import React, { useRef, useState } from "react";
import { Platform } from "react-native";
import { Sheet } from "./sheet";
import { ActionRow } from "./action-row";
import { Button } from "./button";

/** UIKit must finish dismissing this presenter before opening the native picker. */
export function PhotoSourceSheet({
  onClose,
  onSelect,
  title = "Add a photo",
}: {
  onClose: () => void;
  onSelect: (camera: boolean) => void;
  title?: string;
}) {
  const [visible, setVisible] = useState(true);
  const selection = useRef<boolean | undefined>(undefined);
  const completed = useRef(false);
  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    onClose();
    if (selection.current !== undefined) onSelect(selection.current);
  };
  const dismiss = (camera?: boolean) => {
    selection.current = camera;
    setVisible(false);
    if (Platform.OS !== "ios") finish();
  };
  return (
    <Sheet
      title={title}
      visible={visible}
      onDismiss={finish}
      onClose={() => dismiss()}
    >
      <ActionRow
        icon="camera"
        label="Take a photo"
        onPress={() => dismiss(true)}
      />
      <ActionRow
        icon="image"
        label="Choose from library"
        onPress={() => dismiss(false)}
      />
      <Button variant="soft" label="Cancel" onPress={() => dismiss()} />
    </Sheet>
  );
}
