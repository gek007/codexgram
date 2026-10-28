import { data, fixtures } from "./services";
let saved;
export const loadDraft = async (ownerId, postId) =>
  data.scenario === "compose-empty"
    ? null
    : (saved ?? {
        version: 1,
        ownerId,
        postId,
        communityId: "qa-community",
        caption: "QA fixture • A little afternoon pause.",
        localPhotoUri: fixtures.photo,
        width: 1200,
        height: 900,
        expectedRevision: 1,
        requestId: "qa-request",
        updatedAt: Date.now(),
      });
export const saveDraft = async (draft) => {
  saved = draft;
};
export const clearDraft = async () => {
  saved = undefined;
};
export const clearAllDrafts = clearDraft;
export const retainPhoto = async (_, uri) => uri;
export const resetDraft = () => {
  saved = undefined;
};
