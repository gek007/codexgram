import type { Draft } from "./draft-repository";
type Ports = {
  upload: (draft: Draft) => Promise<string>;
  save: (draft: Draft) => Promise<void>;
  create: (draft: Draft) => Promise<string>;
  clear: () => Promise<void>;
  reconcile?: (draft: Draft) => Promise<string | null>;
  assetAvailable?: (assetId: string) => Promise<boolean>;
};
export async function publishDraft(draft: Draft, ports: Ports) {
  if (!draft.communityId || (!draft.localPhotoUri && !draft.postId))
    throw new Error("Photo and community required");
  const committed = await ports.reconcile?.(draft);
  if (committed) {
    await ports.clear();
    return committed;
  }
  let prepared = draft;
  if (
    prepared.uploadedAssetId &&
    ports.assetAvailable &&
    !(await ports.assetAvailable(prepared.uploadedAssetId))
  ) {
    if (!prepared.localPhotoUri) throw new Error("Retained photo missing");
    prepared = {
      ...prepared,
      uploadedAssetId: undefined,
      uploadAttempt: (prepared.uploadAttempt ?? 0) + 1,
    };
    await ports.save(prepared);
  }
  const uploadedAssetId =
    prepared.uploadedAssetId ??
    (prepared.localPhotoUri ? await ports.upload(prepared) : undefined);
  prepared = { ...prepared, uploadedAssetId };
  await ports.save(prepared);
  const id = await ports.create(prepared);
  await ports.clear();
  return id;
}
