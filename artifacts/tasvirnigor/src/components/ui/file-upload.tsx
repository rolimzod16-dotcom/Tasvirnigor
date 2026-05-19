import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X, ImageIcon, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "image/svg+xml", "image/avif", "image/bmp", "image/x-bmp", "image/x-ms-bmp",
];
const ACCEPTED_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "svg", "avif", "bmp",
]);
const MAX_SIZE_BYTES = 25 * 1024 * 1024;
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif,image/bmp,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif,.bmp";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPassthrough(file: File): boolean {
  return file.type === "image/gif" || file.type === "image/svg+xml";
}

async function compressImage(file: File): Promise<File> {
  if (isPassthrough(file)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    const MAX_DIM = 2400;
    let targetW = width;
    let targetH = height;

    if (width > MAX_DIM || height > MAX_DIM) {
      const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
      targetW = Math.round(width * ratio);
      targetH = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) { bitmap.close(); return file; }

    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close();

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve(new File([blob], `${baseName}.webp`, { type: "image/webp" }));
        },
        "image/webp",
        0.85
      );
    });
  } catch {
    return file;
  }
}

function validateFile(file: File): string | null {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  const mimeOk = ACCEPTED_TYPES.includes(file.type) || file.type === "";
  const extOk = ACCEPTED_EXTENSIONS.has(ext);
  if (!mimeOk && !extOk) {
    return `Unsupported format. Use JPG, PNG, WebP, GIF, SVG, AVIF, or BMP.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File is too large (${formatBytes(file.size)}). Maximum allowed size is 25 MB.`;
  }
  return null;
}

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  endpoint: string;
  accept?: string;
  label?: string;
}

export function FileUpload({ value, onChange, endpoint, label }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processFile = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast({ title: "Cannot upload file", description: error, variant: "destructive" });
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setIsUploading(true);

    try {
      const toUpload = await compressImage(file);

      const formData = new FormData();
      formData.append("file", toUpload);

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        let errMsg = `Upload failed (${res.status})`;
        try {
          const body = await res.json();
          if (body.error) errMsg = body.error;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (!data.url) throw new Error("Server did not return a URL.");

      onChange(data.url);
      URL.revokeObjectURL(localPreview);
      setPreview(null);
    } catch (err) {
      URL.revokeObjectURL(localPreview);
      setPreview(null);
      const msg = err instanceof Error ? err.message : "Upload failed. Please try again.";
      toast({ title: "Upload error", description: msg, variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [endpoint, onChange, toast]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const displaySrc = preview ?? value;

  return (
    <div className="flex flex-col gap-3">
      {displaySrc ? (
        <div className="relative group rounded-lg overflow-hidden border border-border bg-muted/30 w-fit max-w-full">
          <img
            src={displaySrc}
            alt="Preview"
            className={cn("max-h-48 max-w-full object-contain block", isUploading && "opacity-60")}
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}
          {!isUploading && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="w-8 h-8"
                onClick={() => { onChange(""); setPreview(null); }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none",
            isDragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/30",
            isUploading && "pointer-events-none opacity-70"
          )}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <>
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
                isDragOver ? "bg-primary/10" : "bg-muted"
              )}>
                {isDragOver ? (
                  <UploadCloud className="w-6 h-6 text-primary" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm font-semibold text-foreground">
                {isDragOver ? "Drop to upload" : (label ?? "Click to upload or drag & drop")}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                JPG, PNG, WebP, GIF, SVG, AVIF, BMP &mdash; max 25 MB
              </p>
            </>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={ACCEPT_ATTR}
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}
