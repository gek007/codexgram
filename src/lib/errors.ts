import { ConvexError } from "convex/values";
const messages: Record<string, string> = {
  UNAUTHENTICATED: "Please sign in again.",
  ONBOARDING_REQUIRED: "Finish setting up your profile.",
  FORBIDDEN: "You do not have permission to do that.",
  NOT_FOUND: "This content is no longer available.",
  BLOCKED: "This account is unavailable.",
  BANNED: "You cannot interact in this community.",
  VALIDATION: "Check your entries and try again.",
  USERNAME_TAKEN: "That username is taken. Try another.",
  HANDLE_TAKEN: "That community handle is taken.",
  QUOTA_EXCEEDED:
    "You’ve shared 10 photos today. You can post again at 00:00 UTC.",
  PHOTO_UPLOAD_LIMIT: "Photo upload limit reached. Try again at 00:00 UTC.",
  AVATAR_UPLOAD_LIMIT:
    "Profile photo upload limit reached. Try again at 00:00 UTC.",
  UPLOAD_REJECTED: "Choose a JPEG photo smaller than 5 MB.",
  ACCOUNT_UNAVAILABLE: "This account is currently unavailable.",
  CONFLICT: "This post changed. Reload before editing again.",
  UPLOAD_IN_PROGRESS: "The upload is still processing. Please retry shortly.",
};
export function errorMessage(error: unknown) {
  if (error instanceof ConvexError)
    return (
      messages[String(error.data)] ?? "Something went wrong. Please try again."
    );
  if (error && typeof error === "object" && "errors" in error) {
    const errors = error.errors;
    if (Array.isArray(errors)) {
      const first = errors[0];
      if (
        first &&
        typeof first === "object" &&
        typeof first.longMessage === "string"
      )
        return first.longMessage;
      if (
        first &&
        typeof first === "object" &&
        typeof first.message === "string"
      )
        return first.message;
    }
  }
  return "Could not complete that action. Check your connection and try again.";
}
