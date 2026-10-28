import { httpRouter } from "convex/server";
import { ConvexError } from "convex/values";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { jpegDimensions, readImageBody } from "./lib/jpeg";
import { verifyWebhook } from "./lib/webhook";
const http = httpRouter();
http.route({
  path: "/media/upload",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!(await ctx.auth.getUserIdentity()))
      return Response.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    try {
      const url = new URL(request.url);
      const purpose = url.searchParams.get("purpose");
      if (
        !["post", "avatar"].includes(purpose ?? "") ||
        request.headers.get("content-type") !== "image/jpeg"
      )
        return Response.json({ error: "UPLOAD_REJECTED" }, { status: 400 });
      const bytes = await readImageBody(request);
      const dimensions = jpegDimensions(bytes);
      const reservation = await ctx.runMutation(internal.media.reserve, {
        requestId: url.searchParams.get("requestId") ?? "",
        purpose: purpose as "post" | "avatar",
        bytes: bytes.length,
        ...dimensions,
      });
      if (reservation.existing)
        return Response.json({ assetId: reservation.id });
      let storageId;
      try {
        storageId = await ctx.storage.store(
          new Blob([bytes as Uint8Array<ArrayBuffer>], { type: "image/jpeg" }),
        );
        await ctx.runMutation(internal.media.finish, {
          assetId: reservation.id,
          storageId,
        });
      } catch (error) {
        if (storageId) await ctx.storage.delete(storageId);
        await ctx.runMutation(internal.media.cancel, {
          assetId: reservation.id,
        });
        throw error;
      }
      return Response.json({ assetId: reservation.id });
    } catch (error) {
      const code =
        error instanceof ConvexError
          ? String(error.data)
          : error instanceof Error && error.message === "UPLOAD_REJECTED"
            ? "UPLOAD_REJECTED"
            : "UPLOAD_FAILED";
      return Response.json(
        { error: code },
        {
          status:
            code === "QUOTA_EXCEEDED"
              ? 429
              : code === "UPLOAD_IN_PROGRESS"
                ? 409
                : code === "UPLOAD_FAILED"
                  ? 503
                  : 400,
        },
      );
    }
  }),
});
http.route({
  path: "/clerk/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) return new Response("Not configured", { status: 503 });
    const body = await request.text();
    if (!(await verifyWebhook(request, secret, body)))
      return new Response("Unauthorized", { status: 401 });
    try {
      const event = JSON.parse(body) as { type: string; data: { id?: string } };
      if (event.type === "user.deleted" && typeof event.data?.id === "string")
        await ctx.runMutation(internal.accounts.externalDeletion, {
          clerkId: event.data.id,
        });
      return new Response("OK");
    } catch {
      return new Response("Invalid event", { status: 400 });
    }
  }),
});
export default http;
