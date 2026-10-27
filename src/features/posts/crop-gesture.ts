export function createCropGesture(
  overflowX: number,
  overflowY: number,
  onChange: (p: { x: number; y: number }) => void,
) {
  let x = 0.5,
    y = 0.5,
    startX = 0.5,
    startY = 0.5;
  return {
    start() {
      startX = x;
      startY = y;
    },
    move(dx: number, dy: number) {
      x =
        overflowX > 0 ? Math.max(0, Math.min(1, startX - dx / overflowX)) : 0.5;
      y =
        overflowY > 0 ? Math.max(0, Math.min(1, startY - dy / overflowY)) : 0.5;
      onChange({ x, y });
    },
  };
}
