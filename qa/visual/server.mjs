// Isolated visual fixtures: no Clerk sessions, network backend, or product routes.
import { createServer } from "vite";
import path from "node:path";
const root = process.cwd();
const mocks = path.join(root, "qa/visual/mocks.jsx");
const server = await createServer({
  root: path.join(root, "qa/visual"),
  server: { port: 5193, host: "127.0.0.1", fs: { allow: [root] } },
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: "react-native-web" },
      ...[
        "expo-image",
        "@expo/vector-icons",
        "react-native-safe-area-context",
        "convex/react",
        "@clerk/expo",
        "expo-router",
        "expo-auth-session",
        "expo-crypto",
      ].map((find) => ({ find, replacement: mocks })),
      { find: "@/providers/session", replacement: mocks },
      { find: "@", replacement: path.join(root, "src") },
    ],
  },
  plugins: [
    {
      name: "local-fixtures",
      enforce: "pre",
      resolveId(source, importer) {
        if (
          importer?.includes("/src/features/posts/") &&
          /^\.\/(media|upload|draft-store)$/.test(source)
        )
          return mocks;
        if (
          /(?:@\/features\/posts|\/src\/features\/posts)\/(media|upload|draft-store)$/.test(
            source,
          )
        )
          return mocks;
      },
      transform(code, id) {
        if (!/\.[jt]sx?$/.test(id) || id.includes("node_modules")) return;
        let imports = "";
        let n = 0;
        code = code.replace(
          /require\(["']([^"']+\.(?:png|jpg))["']\)/g,
          (_, p) => {
            let name = "asset" + n++;
            imports += `import ${name} from ${JSON.stringify(p)};\n`;
            return name;
          },
        );
        return imports + code;
      },
    },
  ],
  optimizeDeps: { include: ["react", "react-dom/client", "react-native-web"] },
});
await server.listen();
console.log("Isolated visual fixtures: http://127.0.0.1:5193");
