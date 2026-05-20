import { useRef, useState, useCallback } from "react";
import { Upload, X, Film, FileJson, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { uploadDirect, bucketFromEndpoint } from "@/lib/upload-direct";

export type MediaType = "image" | "gif" | "video" | "lottie";

interface MediaUploadProps {
  value: string;
  mediaType?: MediaType;
  onChange: (url: string, mediaType: MediaType) => void;
  endpoint?: string;
  className?: string;
  hint?: string;
}

function detectMediaType(file: File): MediaType {
  const mime = file.type.toLowerCase();
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (mime.startsWith("video/") || ["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "video";
  if (mime === "image/gif" || ext === "gif") return "gif";
  if (mime === "application/json" || ext === "json") return "lottie";
  return "image";
}

export function MediaUpload({
  value,
  mediaType = "image",
  onChange,
  endpoint = "/api/upload/service-media",
  className,
  hint,
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const upload = useCallback(
    async (file: File) => {
      const local = detectMediaType(file);
      const MAX_MB = 200;
      if (file.size > MAX_MB * 1024 * 1024) {
        toast({ variant: "destructive", title: `File too large. Maximum size is ${MAX_MB} MB.` });
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const bucket = bucketFromEndpoint(endpoint);
        let url: string;
        let serverMediaType: MediaType;

        if (bucket) {
          url = await uploadDirect(file, bucket, setUploadProgress);
          serverMediaType = local;
        } else {
          // Fallback: proxied upload for custom/unknown endpoints
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch(endpoint, { method: "POST", body: fd, credentials: "include" });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Upload failed");
          url = json.url as string;
          serverMediaType = (json.mediaType as MediaType | undefined) ?? local;
        }

        onChange(url, serverMediaType);
      } catch (err) {
        toast({
          variant: "destructive",
          title: err instanceof Error ? err.message : "Upload failed. Please try again.",
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [endpoint, onChange, toast]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      void upload(files[0]);
    },
    [upload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", "image");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30",
          value && "border-solid border-border/60"
        )}
        onClick={() => !isUploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {value ? (
          <div className="relative group">
            {/* Preview */}
            {mediaType === "video" ? (
              <video
                src={value}
                className="w-full max-h-48 object-cover rounded-xl"
                muted
                loop
                playsInline
                autoPlay
              />
            ) : mediaType === "lottie" ? (
              <div className="flex items-center gap-3 p-4">
                <FileJson className="w-10 h-10 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Lottie JSON</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{value.split("/").pop()}</p>
                </div>
              </div>
            ) : (
              <img
                src={value}
                alt="Preview"
                className="w-full max-h-48 object-cover rounded-xl"
              />
            )}
            {/* Remove button */}
            <button
              type="button"
              onClick={clear}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {/* Replace hint */}
            <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <p className="text-white text-xs font-medium">Click to replace</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
            {isUploading ? (
              <div className="w-full space-y-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Uploading…</p>
                {uploadProgress > 0 && (
                  <div className="w-full max-w-xs mx-auto space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Direct upload</span>
                      <span className="font-mono font-semibold text-primary">{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Film className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Drop media here or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {hint ?? "JPG · PNG · WebP · GIF · SVG · AVIF · MP4 · WebM · MOV · Lottie JSON — max 200 MB"}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                  <Upload className="w-3.5 h-3.5" />
                  Choose file
                </div>
              </>
            )}
          </div>
        )}

        {/* Loading overlay when replacing */}
        {isUploading && value && (
          <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3 bg-black/55 px-6">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            {uploadProgress > 0 && (
              <div className="w-full max-w-[200px] space-y-1">
                <div className="flex justify-between text-xs text-white/70">
                  <span>Uploading</span>
                  <span className="font-mono font-semibold text-white">{uploadProgress}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif,video/mp4,video/webm,video/quicktime,application/json,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif,.mp4,.webm,.mov,.json"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
