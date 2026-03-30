import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const PUBLIC_DIR = path.resolve(process.cwd(), "client/public");
const SOURCE = path.join(PUBLIC_DIR, "favicon.png");

async function writeResizedPng(size: number, targetName: string) {
  const targetPath = path.join(PUBLIC_DIR, targetName);
  const buffer = await sharp(SOURCE)
    .resize(size, size, { fit: "cover" })
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
