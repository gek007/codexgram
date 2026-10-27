import { Directory, File, Paths } from "expo-file-system";
import { createDraftRepository, type Draft } from "./draft-repository";
const directory = (owner: string) =>
  new Directory(
    Paths.document,
    "drafts",
    owner.replace(/[^a-zA-Z0-9_-]/g, "_"),
  );
const queues = new Map<string, Promise<unknown>>();
const repository = createDraftRepository({
  read: async (owner) => {
    const f = new File(directory(owner), "draft.json");
    return f.exists ? f.text() : null;
  },
  write: async (owner, value) => {
    const dir = directory(owner);
    dir.create({ intermediates: true, idempotent: true });
    const temp = new File(dir, "draft.tmp");
    await temp.write(value);
    const target = new File(dir, "draft.json");
    temp.move(target, { overwrite: true });
  },
  remove: async (owner) => {
    const dir = directory(owner);
    if (dir.exists) dir.delete();
  },
});
function serial<T>(owner: string, operation: () => Promise<T>): Promise<T> {
  const next = (queues.get(owner) ?? Promise.resolve())
    .catch(() => {})
    .then(operation);
  queues.set(owner, next);
  return next;
}
export const saveDraft = (draft: Draft) =>
  serial(draft.ownerId, () => repository.save(draft));
export const loadDraft = (owner: string) =>
  serial(owner, () => repository.load(owner));
export const clearDraft = (owner: string) =>
  serial(owner, () => repository.clear(owner));
export async function retainPhoto(
  owner: string,
  uri: string,
  requestId: string,
) {
  const dir = directory(owner);
  dir.create({ intermediates: true, idempotent: true });
  const destination = new File(dir, `${requestId}.jpg`);
  if (!destination.exists) new File(uri).copy(destination);
  return destination.uri;
}
export type { Draft };
