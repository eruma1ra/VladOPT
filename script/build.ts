import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, writeFile } from "fs/promises";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();
  const indexPath = "dist/public/index.html";
  const indexHtml = await readFile(indexPath, "utf-8");
  const optimizedHtml = indexHtml.replace(
    /<link rel="stylesheet"([^>]*?)href="(\/assets\/[^"]+\.css)"([^>]*)>/g,
    (_full, leftAttrs: string, href: string, rightAttrs: string) => {
      const attrs = `${leftAttrs} ${rightAttrs}`;
      const hasCrossorigin = /\bcrossorigin\b/.test(attrs);
      const crossoriginAttr = hasCrossorigin ? " crossorigin" : "";
      return [
        `<link rel="preload" as="style" href="${href}"${crossoriginAttr}>`,
        `<link rel="stylesheet" href="${href}"${crossoriginAttr} media="print" onload="this.media='all'">`,
        `<noscript><link rel="stylesheet" href="${href}"${crossoriginAttr}></noscript>`,
      ].join("\n    ");
    },
  );
  if (optimizedHtml !== indexHtml) {
    await writeFile(indexPath, optimizedHtml, "utf-8");
  }

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
