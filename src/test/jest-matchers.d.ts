/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars -- Declaration merging must match Jest’s generic parameters. */
import type { JestNativeMatchers } from "@testing-library/react-native/matchers";
// RNTL 14 augments @jest/expect; Jest 30.5's matcher interface lives in expect.
declare module "expect" {
  interface Matchers<
    R extends void | Promise<void>,
    T = unknown,
  > extends JestNativeMatchers<R> {}
}
