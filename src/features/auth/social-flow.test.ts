import { expect, test, vi } from "vitest";
import { completeSocialAuth } from "./social-flow";
test("cancelled OAuth stays signed out", async () => {
  expect(
    await completeSocialAuth(async () => ({ createdSessionId: null })),
  ).toBe("cancelled");
});
test("incomplete provider identity requires continuation, not activation", async () => {
  const activate = vi.fn();
  expect(
    await completeSocialAuth(async () => ({
      createdSessionId: null,
      setActive: activate,
      signUp: { status: "missing_requirements" },
    })),
  ).toBe("continue");
  expect(activate).not.toHaveBeenCalled();
});
test("successful OAuth activates exactly the returned session", async () => {
  const activate = vi.fn();
  expect(
    await completeSocialAuth(async () => ({
      createdSessionId: "sess_123",
      setActive: activate,
    })),
  ).toBe("complete");
  expect(activate).toHaveBeenCalledExactlyOnceWith({ session: "sess_123" });
});

test("cancelled browser sessions ignore incomplete stale SDK resources", async () => {
  expect(
    await completeSocialAuth(async () => ({
      createdSessionId: null,
      authSessionResult: { type: "cancel" },
      signIn: { status: "needs_identifier" },
      signUp: { status: "missing_requirements" },
    })),
  ).toBe("cancelled");
});
