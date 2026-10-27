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
  updatedAt: number;
};
export type DraftStorage = {
  read: (key: string) => Promise<string | null>;
  write: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
};
export function createDraftRepository(storage: DraftStorage) {
  return {
    async save(draft: Draft) {
      await storage.write(draft.ownerId, JSON.stringify(draft));
    },
    async load(ownerId: string): Promise<Draft | null> {
      try {
        const value = await storage.read(ownerId);
        if (!value) return null;
        const d = JSON.parse(value) as Partial<Draft>;
        if (
          d.version !== 1 ||
          d.ownerId !== ownerId ||
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
    async clear(ownerId: string) {
      await storage.remove(ownerId);
    },
  };
}
