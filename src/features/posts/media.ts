import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
export type Photo = { uri: string; width: number; height: number };
export async function selectPhoto(camera: boolean): Promise<Photo | null> {
  if (camera) {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new Error("CAMERA_DENIED");
  }
  const result = camera
    ? await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });
  return result.canceled
    ? null
    : {
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
      };
}
export async function rotatePhoto(photo: Photo) {
  const context = ImageManipulator.manipulate(photo.uri);
  context.rotate(90);
  const image = await context.renderAsync();
  return image.saveAsync({ format: SaveFormat.JPEG, compress: 1 });
}
export async function preparePhoto(
  uri: string,
  crop: { originX: number; originY: number; width: number; height: number },
  quarterTurns = 0,
): Promise<Photo> {
  const context = ImageManipulator.manipulate(uri);
  if (quarterTurns) context.rotate(quarterTurns * 90);
  context.crop(crop);
  if (crop.width > 1600) context.resize({ width: 1600 });
  const image = await context.renderAsync();
  return image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
}
