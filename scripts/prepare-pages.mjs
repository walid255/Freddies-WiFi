import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "dist");
const openNextDir = path.join(root, ".open-next");
const assetsDir = path.join(openNextDir, "assets");
const workerDir = path.join(outputDir, "_open-next");

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(openNextDir, workerDir, {
  recursive: true,
  filter: (source) => path.resolve(source) !== path.resolve(assetsDir),
});

for (const entry of await readdir(assetsDir, { withFileTypes: true })) {
  await cp(
    path.join(assetsDir, entry.name),
    path.join(outputDir, entry.name),
    { recursive: true },
  );
}

await writeFile(
  path.join(outputDir, "_worker.js"),
  `import nextWorker from "./_open-next/worker.js";

export default {
  async fetch(request, env, ctx) {
    if (request.method === "GET" || request.method === "HEAD") {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }

    return nextWorker.fetch(request, env, ctx);
  },
};
`,
);

console.log("Prepared Pages Advanced mode worker and static assets in dist/");
