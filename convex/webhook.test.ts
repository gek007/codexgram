import { expect, test } from "vitest";
import { verifyWebhook } from "./lib/webhook";
test("webhook validates the signed body and rejects tampering or replay", async () => {
  const keyBytes = new Uint8Array(32).fill(8);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const secret = "whsec_" + btoa(String.fromCharCode(...keyBytes));
  const timestamp = String(Math.floor(Date.now() / 1000));
  const body = JSON.stringify({ type: "user.deleted", data: { id: "test" } });
  const signed = new TextEncoder().encode(`evt_test.${timestamp}.${body}`);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, signed));
  const signature = "v1," + btoa(String.fromCharCode(...bytes));
  const request = new Request("https://example.com/clerk/webhook", {
    headers: {
      "svix-id": "evt_test",
      "svix-timestamp": timestamp,
      "svix-signature": signature,
    },
  });
  expect(await verifyWebhook(request, secret, body)).toBe(true);
  expect(await verifyWebhook(request, secret, body + " ")).toBe(false);
  const replay = new Request(request, {
    headers: {
      "svix-id": "evt_test",
      "svix-timestamp": String(Number(timestamp) - 600),
      "svix-signature": signature,
    },
  });
  expect(await verifyWebhook(replay, secret, body)).toBe(false);
});
