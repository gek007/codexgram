import { expect, test } from "vitest";
import { publishDraft } from "./publish-flow";
import type { Draft } from "./draft-repository";
test("a failed publish preserves the uploaded asset and request ID for safe retry", async () => {
  let stored: Draft = {
    version: 1,
    ownerId: "alice",
    communityId: "community",
    requestId: "same-request",
    localPhotoUri: "file:///photo.jpg",
    caption: "Keep me",
    updatedAt: 1,
  };
  let cleared = false;
  let first = true;
  const seen: string[] = [];
  const ports = {
    upload: async () => "asset-1",
    save: async (d: Draft) => {
      stored = d;
    },
    create: async (d: Draft) => {
      seen.push(d.requestId);
      if (first) {
        first = false;
        throw new Error("Response lost");
      }
      return "post-1";
    },
    clear: async () => {
      cleared = true;
    },
  };
  await expect(publishDraft(stored, ports)).rejects.toThrow("Response lost");
  expect(stored.uploadedAssetId).toBe("asset-1");
  expect(cleared).toBe(false);
  expect(await publishDraft(stored, ports)).toBe("post-1");
  expect(seen).toEqual(["same-request", "same-request"]);
  expect(cleared).toBe(true);
});

test("expired pending assets are renewed without changing the publish request", async () => {
  let prepared: Draft | undefined;
  const id = await publishDraft(
    {
      version: 1,
      ownerId: "a",
      communityId: "c",
      requestId: "stable",
      caption: "Hello",
      localPhotoUri: "file:///retained.jpg",
      uploadedAssetId: "expired",
      updatedAt: 1,
    },
    {
      reconcile: async () => null,
      assetAvailable: async () => false,
      upload: async (d) => {
        expect(d.uploadAttempt).toBe(1);
        return "renewed";
      },
      save: async (d) => {
        prepared = d;
      },
      create: async (d) => {
        expect(d.requestId).toBe("stable");
        expect(d.uploadedAssetId).toBe("renewed");
        return "post";
      },
      clear: async () => {},
    },
  );
  expect(id).toBe("post");
  expect(prepared?.uploadedAssetId).toBe("renewed");
});
test("committed replacement is reconciled before checking its now-attached asset", async () => {
  let cleared = false;
  const id = await publishDraft(
    {
      version: 1,
      ownerId: "a",
      postId: "p",
      communityId: "c",
      requestId: "edit",
      caption: "Edited",
      uploadedAssetId: "attached",
      expectedRevision: 3,
      updatedAt: 1,
    },
    {
      reconcile: async () => "p",
      assetAvailable: async () => {
        throw new Error("Must reconcile first");
      },
      upload: async () => {
        throw new Error("Must not reupload");
      },
      save: async () => {},
      create: async () => {
        throw new Error("Must not edit twice");
      },
      clear: async () => {
        cleared = true;
      },
    },
  );
  expect(id).toBe("p");
  expect(cleared).toBe(true);
});
