import fs from "fs/promises";
import path from "path";
import { optimizeUploadedImage, isOptimizableImageExtension } from "../server/services/image-optimizer";

type Stat = {
  checked: number;
  optimized: number;
  skipped: number;
  failed: number;
  bytesBefore: number;
  bytesAfter: number;
};

async function optimizeUploadsFolder() {
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  const stat: Stat = {
    checked: 0,
    optimized: 0,
    skipped: 0,
    failed: 0,
    bytesBefore: 0,
    bytesAfter: 0,
  };

  try {
    await fs.access(uploadsDir);
  } catch {
    console.log(`Папка uploads не найдена: ${uploadsDir}`);
    return;
  }

  const entries = await fs.readdir(uploadsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const filePath = path.join(uploadsDir, entry.name);
    const ext = path.extname(entry.name).toLowerCase();

    if (!isOptimizableImageExtension(ext)) {
      stat.skipped += 1;
      continue;
    }

    stat.checked += 1;

    try {
      const original = await fs.readFile(filePath);
      stat.bytesBefore += original.length;

      const optimized = await optimizeUploadedImage(original, ext);
      if (!optimized.length || optimized.length >= original.length) {
        stat.bytesAfter += original.length;
        continue;
      }

      await fs.writeFile(filePath, optimized);
      stat.optimized += 1;
      stat.bytesAfter += optimized.length;
      console.log(`Оптимизировано: ${entry.name} (${Math.round((1 - optimized.length / original.length) * 100)}%)`);
    } catch (error) {
      stat.failed += 1;
      try {
        const fallback = await fs.stat(filePath);
        stat.bytesAfter += fallback.size;
      } catch {
        // no-op
      }
      console.error(`Ошибка оптимизации ${entry.name}:`, error);
    }
  }

  const saved = Math.max(0, stat.bytesBefore - stat.bytesAfter);
  const savedMb = (saved / (1024 * 1024)).toFixed(2);
  console.log("Готово:");
  console.log(`- Проверено файлов: ${stat.checked}`);
  console.log(`- Оптимизировано: ${stat.optimized}`);
  console.log(`- Пропущено: ${stat.skipped}`);
  console.log(`- Ошибок: ${stat.failed}`);
  console.log(`- Экономия: ${savedMb} MB`);
}

optimizeUploadsFolder().catch((error) => {
  console.error("Скрипт оптимизации завершился с ошибкой:", error);
  process.exitCode = 1;
});
