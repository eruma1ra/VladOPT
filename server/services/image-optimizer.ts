import sharp from "sharp";

const MAX_IMAGE_DIMENSION = 2200;
const IMAGE_QUALITY = 82;

function normalizeExtension(extension: string): ".jpg" | ".jpeg" | ".png" | ".webp" | null {
  const ext = extension.toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp") {
    return ext;
  }
  return null;
}

export function isOptimizableImageExtension(extension: string): boolean {
  return normalizeExtension(extension) !== null;
}

export async function optimizeUploadedImage(buffer: Buffer, extension: string): Promise<Buffer> {
  const ext = normalizeExtension(extension);
  if (!ext) return buffer;

  const pipeline = sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });

  if (ext === ".png") {
    return pipeline
      .png({
        compressionLevel: 9,
        palette: true,
        quality: IMAGE_QUALITY,
      })
      .toBuffer();
  }

  if (ext === ".webp") {
    return pipeline.webp({ quality: IMAGE_QUALITY, effort: 5 }).toBuffer();
  }

  return pipeline.jpeg({ quality: IMAGE_QUALITY, mozjpeg: true }).toBuffer();
}
