import { type ChangeEvent, useRef, useState } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ACCEPTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCEPT_ATTRIBUTE = "image/jpeg,image/png,image/webp";
const MAX_FILE_SIZE_MB = 8;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type ImageDropzoneProps = {
  value: string[];
  onChange: (next: string[]) => void;
  maxFiles?: number;
  className?: string;
  previewAspect?: "square" | "landscape";
  hint?: string;
  showPreview?: boolean;
};

export function ImageDropzone({
  value,
  onChange,
  maxFiles,
  className,
  previewAspect = "square",
  hint,
  showPreview = true,
}: ImageDropzoneProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadOneFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/uploads/image", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Не удалось загрузить файл");
    }

    const payload = (await res.json()) as { url?: string };
    if (!payload.url) {
      throw new Error("Сервер не вернул URL изображения");
    }

    return payload.url;
  };

  const handleFiles = async (list: FileList | File[]) => {
    const allFiles = Array.from(list);
    if (allFiles.length === 0) return;

    const validFiles: File[] = [];
    for (const file of allFiles) {
      if (!ACCEPTED_MIME_TYPES.has(file.type)) {
        toast({
          title: "Неподдерживаемый формат",
          description: "Разрешены только JPG, JPEG, PNG и WEBP.",
          variant: "destructive",
        });
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: "Файл слишком большой",
          description: `Максимальный размер: ${MAX_FILE_SIZE_MB} МБ.`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const limit = maxFiles ?? Number.POSITIVE_INFINITY;
    let filesToUpload = validFiles;

    if (limit === 1) {
      filesToUpload = [validFiles[0]];
    } else if (value.length + validFiles.length > limit) {
      const availableSlots = Math.max(limit - value.length, 0);
      filesToUpload = validFiles.slice(0, availableSlots);
      toast({
        title: "Достигнут лимит",
        description: `Можно загрузить максимум ${limit} изображений.`,
      });
    }

    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of filesToUpload) {
        const uploadedUrl = await uploadOneFile(file);
        uploadedUrls.push(uploadedUrl);
      }

      if (limit === 1) {
        onChange([uploadedUrls[uploadedUrls.length - 1]]);
      } else {
        onChange([...value, ...uploadedUrls]);
      }
    } catch (error: any) {
      toast({
        title: "Ошибка загрузки",
        description: error?.message ?? "Не удалось загрузить изображение.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      await handleFiles(files);
    }
    event.target.value = "";
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        multiple={(maxFiles ?? 99) > 1}
        className="hidden"
        onChange={handleInputChange}
      />

      <button
        type="button"
        disabled={isUploading}
        className={cn(
          "w-full rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          "border-slate-300 bg-slate-50 hover:border-primary/60 hover:bg-primary/5",
          isDragging && "border-primary bg-primary/10",
          isUploading && "cursor-not-allowed opacity-70",
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDragging(false);
          await handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-col items-center gap-2 text-slate-600">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <UploadCloud className="h-6 w-6 text-primary" />
          )}
          <div className="font-medium">
            {isUploading ? "Загрузка..." : "Перетащите изображение сюда или нажмите для выбора"}
          </div>
          <div className="text-xs text-slate-500">
            JPG, JPEG, PNG, WEBP, до {MAX_FILE_SIZE_MB} МБ
          </div>
          {hint ? (
            <div className="text-xs text-slate-500">{hint}</div>
          ) : null}
        </div>
      </button>

      {showPreview && value.length > 0 && (
        <div
          className={
            previewAspect === "landscape"
              ? "grid grid-cols-1 md:grid-cols-2 gap-3"
              : "grid grid-cols-2 md:grid-cols-3 gap-3"
          }
        >
          {value.map((url, idx) => (
            <div key={`${url}-${idx}`} className="relative overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img
                src={url}
                alt={`Изображение ${idx + 1}`}
                width={previewAspect === "landscape" ? 1280 : 640}
                height={previewAspect === "landscape" ? 720 : 640}
                loading="lazy"
                decoding="async"
                className={cn(
                  "w-full object-cover",
                  previewAspect === "landscape" ? "aspect-video" : "h-28"
                )}
              />
              <button
                type="button"
                aria-label={`Удалить изображение ${idx + 1}`}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/75"
                onClick={() => removeAt(idx)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
