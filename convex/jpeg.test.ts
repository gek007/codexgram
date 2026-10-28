import { expect, test } from "vitest";
import { jpegDimensions } from "./lib/jpeg";
test("a JPEG frame header without image scan data is rejected", () => {
  expect(() =>
    jpegDimensions(
      new Uint8Array([255, 216, 255, 192, 0, 8, 8, 0, 1, 0, 1, 0, 255, 217]),
    ),
  ).toThrow("UPLOAD_REJECTED");
});

test("a valid image at the maximum supported dimensions still passes decoding limits", async () => {
  const { encode } = await import("jpeg-js");
  const encoded = encode(
    {
      width: 1600,
      height: 1600,
      data: new Uint8Array(1600 * 1600 * 4).fill(255),
    },
    70,
  );
  expect(jpegDimensions(new Uint8Array(encoded.data))).toEqual({
    width: 1600,
    height: 1600,
  });
});
