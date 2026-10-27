export async function verifyWebhook(
  request: Request,
  secret: string,
  body: string,
) {
  try {
    const id = request.headers.get("svix-id");
    const timestamp = request.headers.get("svix-timestamp");
    const signatures = request.headers.get("svix-signature");
    if (
      !id ||
      !timestamp ||
      !signatures ||
      !/^[0-9]+$/.test(timestamp) ||
      Math.abs(Date.now() / 1000 - Number(timestamp)) > 300
    )
      return false;
    const key = Uint8Array.from(atob(secret.replace(/^whsec_/, "")), (c) =>
      c.charCodeAt(0),
    );
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const payload = new TextEncoder().encode(`${id}.${timestamp}.${body}`);
    for (const part of signatures.split(" ")) {
      const [version, value] = part.split(",");
      if (version !== "v1" || !value) continue;
      const signature = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
      if (await crypto.subtle.verify("HMAC", cryptoKey, signature, payload))
        return true;
    }
    return false;
  } catch {
    return false;
  }
}
