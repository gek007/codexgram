type Result = {
  createdSessionId: string | null;
  authSessionResult?: { type: string } | null;
  setActive?: ((params: { session: string }) => Promise<unknown>) | null;
  signUp?: { status: string | null };
  signIn?: { status: string | null };
};
export async function completeSocialAuth(
  start: () => Promise<Result>,
): Promise<"complete" | "continue" | "cancelled"> {
  const result = await start();
  if (
    result.authSessionResult &&
    ["cancel", "dismiss"].includes(result.authSessionResult.type)
  )
    return "cancelled";
  if (result.createdSessionId && result.setActive) {
    await result.setActive({ session: result.createdSessionId });
    return "complete";
  }
  if (
    result.signUp?.status === "missing_requirements" ||
    (result.signIn?.status && result.signIn.status !== "complete")
  )
    return "continue";
  return "cancelled";
}
