import type { Draft } from "./draft-repository";
type Ports = {
  upload: (draft: Draft) => Promise<string>;
  save: (draft: Draft) => Promise<void>;
  create: (draft: Draft) => Promise<string>;
  clear: () => Promise<void>;
};
export async function publishDraft(draft: Draft, ports: Ports) {
  if (!draft.communityId || (!draft.localPhotoUri && !draft.postId))
    throw new Error("Photo and community required");
  const uploadedAssetId =
    draft.uploadedAssetId ??
    (draft.localPhotoUri ? await ports.upload(draft) : undefined);
  const prepared = { ...draft, uploadedAssetId };
  await ports.save(prepared);
  const id = await ports.create(prepared);
  await ports.clear();
  return id;
}
