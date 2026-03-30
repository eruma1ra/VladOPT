import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(
    express.static(distPath, {
      etag: true,
      index: false,
      setHeaders: (res, filePath) => {
        const normalized = filePath.replace(/\\/g, "/");
        if (normalized.includes("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          return;
        }
        if (normalized.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, must-revalidate");
          return;
        }
        res.setHeader("Cache-Control", "public, max-age=86400");
      },
    }),
  );

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
