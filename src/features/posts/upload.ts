import { fetch } from "expo/fetch";
import { File } from "expo-file-system";
import { ConvexError } from "convex/values";
import type { Id } from "../../../convex/_generated/dataModel";
export async function uploadPhoto({
  uri,
  purpose,
  requestId,
  getToken,
}: {
  uri: string;
  purpose: "post" | "avatar";
  requestId: string;
  getToken: () => Promise<string | null>;
}): Promise<Id<"mediaAssets">> {
  const token = await getToken();
  if (!token) throw new ConvexError("UNAUTHENTICATED");
  const endpoint = process.env.EXPO_PUBLIC_CONVEX_SITE_URL;
  if (!endpoint) throw new Error("Missing HTTP endpoint");
  const response = await fetch(
    `${endpoint}/media/upload?purpose=${purpose}&requestId=${encodeURIComponent(requestId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
        Authorization: `Bearer ${token}`,
      },
      body: new File(uri),
    },
  );
  const result = (await response.json()) as {
    assetId?: Id<"mediaAssets">;
    error?: string;
  };
  if (!response.ok || !result.assetId)
    throw new ConvexError(
      result.error === "QUOTA_EXCEEDED"
        ? purpose === "avatar"
          ? "AVATAR_UPLOAD_LIMIT"
          : "PHOTO_UPLOAD_LIMIT"
        : (result.error ?? "UPLOAD_REJECTED"),
    );
  return result.assetId;
}
