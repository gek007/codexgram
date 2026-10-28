import { decode } from "jpeg-js";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export function jpegDimensions(bytes: Uint8Array) {
  if (
    bytes.length < 12 ||
    bytes.length > MAX_IMAGE_BYTES ||
    bytes[0] !== 255 ||
    bytes[1] !== 216 ||
    bytes[bytes.length - 2] !== 255 ||
    bytes[bytes.length - 1] !== 217
  )
    throw new Error("UPLOAD_REJECTED");
  let at = 2;
  while (at + 8 < bytes.length) {
    if (bytes[at++] !== 255) throw new Error("UPLOAD_REJECTED");
    let marker = bytes[at++];
    while (marker === 255) marker = bytes[at++];
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 1 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const length = (bytes[at] << 8) | bytes[at + 1];
    if (length < 2 || at + length > bytes.length)
      throw new Error("UPLOAD_REJECTED");
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      const height = (bytes[at + 3] << 8) | bytes[at + 4];
      const width = (bytes[at + 5] << 8) | bytes[at + 6];
      if (width < 1 || height < 1 || width > 1600 || height > 1600)
        throw new Error("UPLOAD_REJECTED");
      try {
        const decoded = decode(bytes, {
          useTArray: true,
          formatAsRGBA: false,
          tolerantDecoding: false,
          maxResolutionInMP: 3,
          maxMemoryUsageInMB: 64,
        });
        if (
          decoded.width !== width ||
          decoded.height !== height ||
          decoded.data.length !== width * height * 3
        )
          throw new Error();
      } catch {
        throw new Error("UPLOAD_REJECTED");
      }
      return { width, height };
    }
    at += length;
  }
  throw new Error("UPLOAD_REJECTED");
}
export async function readImageBody(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_IMAGE_BYTES)
    throw new Error("UPLOAD_REJECTED");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("UPLOAD_REJECTED");
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    total += next.value.length;
    if (total > MAX_IMAGE_BYTES) {
      await reader.cancel();
      throw new Error("UPLOAD_REJECTED");
    }
    chunks.push(next.value);
  }
  const data = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.length;
  }
  return data;
}
