import { ConvexError } from "convex/values";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Draft } from "./draft-repository";
export function makeEditInput(draft: Draft) {
  if (
    !draft.postId ||
    !Number.isInteger(draft.expectedRevision) ||
    draft.expectedRevision! < 0
  )
    throw new ConvexError("CONFLICT");
  return {
    postId: draft.postId as Id<"posts">,
    caption: draft.caption,
    assetId: draft.uploadedAssetId as Id<"mediaAssets"> | undefined,
    expectedRevision: draft.expectedRevision!,
    requestId: draft.requestId,
  };
}
