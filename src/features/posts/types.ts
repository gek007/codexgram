import type { FunctionReturnType } from "convex/server";
import type { api } from "../../../convex/_generated/api";
export type PostCardData = FunctionReturnType<
  typeof api.feed.home
>["page"][number];
