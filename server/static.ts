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

  // For missing static assets, return 404 instead of SPA index.html.
  // This prevents bots from receiving HTML for /favicon.ico and similar files.
  app.use("/{*path}", (req, res, next) => {
    const requestedPath = (req.originalUrl || "").split("?")[0] || "";
    if (path.extname(requestedPath)) {
      res.status(404).end();
      return;
    }
    next();
  });

  // fall through to index.html for SPA routes without file extension
  app.use("/{*path}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
