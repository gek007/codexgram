const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
// Native QA is opt-in on a separate local Metro server. Release/default builds
// never import fixtures or replace authentication and database modules.
if (process.env.CODEXGRAM_NATIVE_QA === "1") {
  if (process.env.NODE_ENV === "production")
    throw new Error("Native QA fixtures are restricted to local development.");
  const path = require("node:path");
  const fixture = (file) => path.join(__dirname, "qa/native", file);
  const external = new Set([
    "@clerk/expo",
    "@clerk/expo/token-cache",
    "convex/react",
    "convex/react-clerk",
  ]);
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (context.isDev === false)
      throw new Error("Native QA fixtures cannot be bundled for production.");
    if (external.has(moduleName))
      return { type: "sourceFile", filePath: fixture("services.jsx") };
    const resolved = context.resolveRequest(context, moduleName, platform);
    const file = resolved.filePath?.replaceAll("\\", "/");
    if (file?.endsWith("/src/providers/session.tsx"))
      return { type: "sourceFile", filePath: fixture("services.jsx") };
    if (file?.endsWith("/src/features/posts/draft-store.ts"))
      return { type: "sourceFile", filePath: fixture("drafts.js") };
    if (file?.endsWith("/src/features/posts/upload.ts"))
      return { type: "sourceFile", filePath: fixture("upload.js") };
    if (
      file?.endsWith("/src/app/_layout.tsx") &&
      !context.originModulePath.endsWith("/qa/native/root-layout.jsx")
    )
      return { type: "sourceFile", filePath: fixture("root-layout.jsx") };
    return resolved;
  };
}
module.exports = config;
