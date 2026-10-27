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
          borderRadius: 2,
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
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderWidth: 2,
            borderColor: "#FFFFFF",
          }}
        >
          {[1, 2].map((n) => (
            <React.Fragment key={n}>
              <View
                style={{
                  position: "absolute",
                  left: `${(n * 100) / 3}%`,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  backgroundColor: "rgba(255,255,255,0.6)",
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: `${(n * 100) / 3}%`,
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: "rgba(255,255,255,0.6)",
                }}
              />
            </React.Fragment>
          ))}
        </View>
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
        label="Done"
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
