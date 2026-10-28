import { Directory, File, Paths } from "expo-file-system";
import { createDraftRepository, type Draft } from "./draft-repository";
const directory = (owner: string) =>
  new Directory(
    Paths.document,
    "drafts",
    owner.replace(/[^a-zA-Z0-9_-]/g, "_"),
  );
const slot = (owner: string, postId?: string | null) =>
  new Directory(directory(owner), encodeURIComponent(postId ?? "new"));
function location(key: string) {
  const [owner, target] = JSON.parse(key) as [string, string | null];
  const dir = slot(owner, target);
  return {
    owner,
    target,
    dir,
    file: new File(dir, "draft.json"),
    legacy: new File(directory(owner), "draft.json"),
  };
}
async function matchingLegacy(
  file: File,
  owner: string,
  target: string | null,
) {
  if (!file.exists) return false;
  try {
    const d = JSON.parse(await file.text()) as Draft;
    return d.ownerId === owner && (d.postId ?? null) === target;
  } catch {
    return false;
  }
}
const repository = createDraftRepository({
  read: async (key) => {
    const { owner, target, file, legacy } = location(key);
    if (file.exists) return file.text();
    return (await matchingLegacy(legacy, owner, target)) ? legacy.text() : null;
  },
  write: async (key, value) => {
    const { owner, target, dir, file, legacy } = location(key);
    dir.create({ intermediates: true, idempotent: true });
    const temp = new File(dir, "draft.tmp");
    await temp.write(value);
    temp.move(file, { overwrite: true });
    if (await matchingLegacy(legacy, owner, target)) legacy.delete();
  },
  remove: async (key) => {
    const { owner, target, dir, file, legacy } = location(key);
    const metadata = file.exists
      ? file
      : (await matchingLegacy(legacy, owner, target))
        ? legacy
        : null;
    if (metadata) {
      try {
        const d = JSON.parse(await metadata.text()) as Draft;
        if (d.localPhotoUri?.startsWith(directory(owner).uri + "/")) {
          const photo = new File(d.localPhotoUri);
          if (photo.exists) photo.delete();
        }
      } catch {}
      if (metadata.exists) metadata.delete();
    }
    if (dir.exists) dir.delete();
  },
});
const queues = new Map<string, Promise<unknown>>();
function serial<T>(owner: string, operation: () => Promise<T>): Promise<T> {
  const next = (queues.get(owner) ?? Promise.resolve())
    .catch(() => {})
    .then(operation);
  queues.set(owner, next);
  return next;
}
export const saveDraft = (draft: Draft) =>
  serial(draft.ownerId, () => repository.save(draft));
export const loadDraft = (owner: string, postId?: string) =>
  serial(owner, () => repository.load(owner, postId));
export const clearDraft = (owner: string, postId?: string) =>
  serial(owner, () => repository.clear(owner, postId));
export const clearAllDrafts = (owner: string) =>
  serial(owner, async () => {
    const dir = directory(owner);
    if (dir.exists) dir.delete();
  });
export async function retainPhoto(
  owner: string,
  uri: string,
  requestId: string,
  postId?: string,
) {
  const dir = slot(owner, postId);
  dir.create({ intermediates: true, idempotent: true });
  const destination = new File(dir, `${requestId}.jpg`);
  if (!destination.exists) new File(uri).copy(destination);
  return destination.uri;
}
export type { Draft };
