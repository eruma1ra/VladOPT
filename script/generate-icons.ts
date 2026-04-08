import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const PUBLIC_DIR = path.resolve(process.cwd(), "client/public");
const SOURCE = path.join(PUBLIC_DIR, "favicon.png");
const ICON_PADDING_FACTOR = 0.96;

async function writeResizedPng(size: number, targetName: string) {
  const targetPath = path.join(PUBLIC_DIR, targetName);
  const innerSize = Math.max(1, Math.round(size * ICON_PADDING_FACTOR));
  const offset = Math.max(0, Math.floor((size - innerSize) / 2));
  const inner = await sharp(SOURCE)
    .trim()
    .resize(innerSize, innerSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const buffer = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: inner, left: offset, top: offset }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  await fs.writeFile(targetPath, buffer);
  return buffer;
}

async function generateIcons() {
  await fs.access(SOURCE);

  const png16 = await writeResizedPng(16, "favicon-16x16.png");
  const png32 = await writeResizedPng(32, "favicon-32x32.png");
  const png48 = await writeResizedPng(48, "favicon-48x48.png");
  await writeResizedPng(180, "apple-touch-icon.png");
  await writeResizedPng(192, "android-chrome-192x192.png");
  await writeResizedPng(512, "android-chrome-512x512.png");

  const ico = await pngToIco([png16, png32, png48]);
  await fs.writeFile(path.join(PUBLIC_DIR, "favicon.ico"), ico);

  console.log("Icons generated in client/public");
}

generateIcons().catch((error) => {
  console.error("Icon generation failed:", error);
  process.exitCode = 1;
});
