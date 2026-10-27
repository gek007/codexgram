import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  PanResponder,
  Image,
  useWindowDimensions,
} from "react-native";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/theme/theme-provider";
import { preparePhoto, rotatePhoto, type Photo } from "./media";
import { createCropGesture } from "./crop-gesture";
export function PhotoEditor({
  photo,
  onDone,
  onCancel,
}: {
  photo: Photo;
  onDone: (photo: Photo) => void;
  onCancel: () => void;
}) {
  const { colors } = useTheme();
  const [source, setSource] = useState(photo);
  const [offset, setOffset] = useState({ x: 0.5, y: 0.5 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const size = Math.min(useWindowDimensions().width - 44, 400);
  const side = Math.min(source.width, source.height);
  const scaledWidth = (source.width / side) * size;
  const scaledHeight = (source.height / side) * size;
  const pan = useMemo(() => {
    const gesture = createCropGesture(
      scaledWidth - size,
      scaledHeight - size,
      setOffset,
    );
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !busy,
      onPanResponderGrant: () => gesture.start(),
      onPanResponderMove: (_, state) => gesture.move(state.dx, state.dy),
    });
  }, [busy, scaledWidth, scaledHeight, size]);
  return (
    <View style={{ gap: 16 }}>
      <Text style={{ color: colors.muted }}>
        Drag to frame your photo. Rotate to find its best angle.
      </Text>
      <View
        accessibilityLabel="Photo crop preview"
        {...pan.panHandlers}
        style={{
          width: size,
          height: size,
          overflow: "hidden",
          borderRadius: 20,
          backgroundColor: colors.secondary,
          alignSelf: "center",
        }}
      >
        <Image
          source={{ uri: source.uri }}
          style={{
            width: scaledWidth,
            height: scaledHeight,
            left: -(scaledWidth - size) * offset.x,
            top: -(scaledHeight - size) * offset.y,
          }}
        />
      </View>
      <Button
        secondary
        label="Rotate 90°"
        loading={busy}
        onPress={() => {
          setBusy(true);
          void rotatePhoto(source)
            .then((p) => {
              setSource(p);
              setOffset({ x: 0.5, y: 0.5 });
            })
            .catch(() =>
              setError("Could not rotate this photo. Try another image."),
            )
            .finally(() => setBusy(false));
        }}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
      <Button
        label="Use this photo"
        loading={busy}
        onPress={() => {
          setBusy(true);
          void preparePhoto(source.uri, {
            originX: Math.round((source.width - side) * offset.x),
            originY: Math.round((source.height - side) * offset.y),
            width: side,
            height: side,
          })
            .then(onDone)
            .catch(() =>
              setError("Could not prepare this photo. Try another image."),
            )
            .finally(() => setBusy(false));
        }}
      />
      <Button
        secondary
        label="Cancel photo"
        disabled={busy}
        onPress={onCancel}
      />
    </View>
  );
}
