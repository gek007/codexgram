import { expect, test } from "vitest";
import { createCropGesture } from "./crop-gesture";
test("crop pan accumulates across gestures and clamps to image edges", () => {
  let last = { x: 0, y: 0 };
  const model = createCropGesture(100, 0, (p) => {
    last = p;
  });
  model.start();
  model.move(20, 5);
  expect(last).toEqual({ x: 0.3, y: 0.5 });
  model.start();
  model.move(10, 0);
  expect(last.x).toBeCloseTo(0.2);
  model.move(200, 0);
  expect(last.x).toBe(0);
  model.move(-500, 0);
  expect(last.x).toBe(1);
});
