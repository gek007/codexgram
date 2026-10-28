export type Draft = {
  version: 1;
  ownerId: string;
  requestId: string;
  communityId?: string;
  postId?: string;
  caption: string;
  localPhotoUri?: string;
  width?: number;
  height?: number;
  uploadedAssetId?: string;
  uploadAttempt?: number;
  expectedRevision?: number;
  updatedAt: number;
};
export type DraftStorage = {
  read: (key: string) => Promise<string | null>;
  write: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
};
export const draftKey = (ownerId: string, postId?: string) =>
  JSON.stringify([ownerId, postId ?? null]);
export function createDraftRepository(storage: DraftStorage) {
  return {
    async save(draft: Draft) {
      await storage.write(
        draftKey(draft.ownerId, draft.postId),
        JSON.stringify(draft),
      );
    },
    async load(ownerId: string, postId?: string): Promise<Draft | null> {
      try {
        const value = await storage.read(draftKey(ownerId, postId));
        if (!value) return null;
        const d = JSON.parse(value) as Partial<Draft>;
        if (
          d.version !== 1 ||
          d.ownerId !== ownerId ||
          d.postId !== postId ||
          typeof d.requestId !== "string" ||
          typeof d.caption !== "string" ||
          typeof d.updatedAt !== "number"
        )
          return null;
        return d as Draft;
      } catch {
        return null;
      }
    },
    async clear(ownerId: string, postId?: string) {
      await storage.remove(draftKey(ownerId, postId));
    },
  };
}
