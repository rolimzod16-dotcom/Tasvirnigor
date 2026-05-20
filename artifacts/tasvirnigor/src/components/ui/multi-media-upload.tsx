import { useRef, useState, useCallback } from "react";
import { Upload, X, Film, Image, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { uploadDirect, bucketFromEndpoint } from "@/lib/upload-direct";

export type MediaItemValue = {
  url: string;
  mimeType: string;
  name: string;
  sortOrder: number;
};

interface MultiMediaUploadProps {
  value: MediaItemValue[];
  onChange: (items: MediaItemValue[]) => void;
  endpoint?: string;
  maxItems?: number;
  className?: string;
}

function getMediaIcon(mimeType: string) {
  if (mimeType.startsWith("video/")) return <Film className="w-4 h-4 text-blue-500" />;
  if (mimeType === "image/gif") return <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded-full">GIF</span>;
  return <Image className="w-4 h-4 text-muted-foreground" />;
}

function MediaThumb({ item }: { item: MediaItemValue }) {
  const isVideo = item.mimeType.startsWith("video/");
  if (isVideo) {
    return (
      <video
        src={item.url}
        className="w-full h-full object-cover"
        muted
        playsInline
        preload="metadata"
      />
    );
  }
  return (
    <img
      src={item.url}
      alt={item.name}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
}

export function MultiMediaUpload({
  value,
  onChange,
  endpoint = "/api/upload/project-media",
  maxItems = 20,
  className,
}: MultiMediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = useCallback(
    async (file: File) => {
      const MAX_MB = 200;
      if (file.size > MAX_MB * 1024 * 1024) {
        toast({ variant: "destructive", title: `File too large (max ${MAX_MB} MB): ${file.name}` });
        return null;
      }

      const tempId = `${Date.now()}-${file.name}`;
      setUploading((prev) => [...prev, tempId]);
      setProgressMap((prev) => ({ ...prev, [tempId]: 0 }));

      try {
        const bucket = bucketFromEndpoint(endpoint);
        let url: string;
        let mimeType: string;

        if (bucket) {
          url = await uploadDirect(file, bucket, (pct) => {
            setProgressMap((prev) => ({ ...prev, [tempId]: pct }));
          });
          mimeType = file.type || "application/octet-stream";
        } else {
          // Fallback: proxied upload for custom endpoints
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch(endpoint, { method: "POST", body: fd, credentials: "include" });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Upload failed");
          url = json.url as string;
          mimeType = (json.mimeType as string | undefined) ?? file.type ?? "application/octet-stream";
        }

        return {
          url,
          mimeType,
          name: file.name,
          sortOrder: 0,
        } satisfies Omit<MediaItemValue, "sortOrder"> & { sortOrder: number };
      } catch (err) {
        toast({
          variant: "destructive",
          title: err instanceof Error ? err.message : "Upload failed",
        });
        return null;
      } finally {
        setUploading((prev) => prev.filter((id) => id !== tempId));
        setProgressMap((prev) => {
          const next = { ...prev };
          delete next[tempId];
          return next;
        });
      }
    },
    [endpoint, toast]
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const available = maxItems - value.length;
      const toUpload = Array.from(files).slice(0, available);
      if (toUpload.length === 0) {
        toast({ title: `Maximum ${maxItems} files allowed` });
        return;
      }

      const results = await Promise.all(toUpload.map(uploadFile));
      const newItems = results.filter(Boolean) as MediaItemValue[];
      if (newItems.length > 0) {
        const nextItems = [
          ...value,
          ...newItems.map((item, i) => ({ ...item, sortOrder: value.length + i })),
        ];
        onChange(nextItems);
      }
    },
    [value, onChange, uploadFile, maxItems, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      void handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const remove = (idx: number) => {
    const next = value
      .filter((_, i) => i !== idx)
      .map((item, i) => ({ ...item, sortOrder: i }));
    onChange(next);
  };

  const move = (idx: number, dir: "up" | "down") => {
    const next = [...value];
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target]!, next[idx]!];
    onChange(next.map((item, i) => ({ ...item, sortOrder: i })));
  };

  const isUploading = uploading.length > 0;
  const canAdd = value.length < maxItems;

  // Overall progress: average of in-flight items
  const overallProgress = uploading.length > 0
    ? Math.round(uploading.reduce((sum, id) => sum + (progressMap[id] ?? 0), 0) / uploading.length)
    : 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Upload zone */}
      {canAdd && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
            isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
          onClick={() => !isUploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
        >
          <div className="flex flex-col items-center justify-center gap-2 py-6 px-4 text-center">
            {isUploading ? (
              <div className="w-full space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Uploading {uploading.length} file{uploading.length > 1 ? "s" : ""}…
                  </p>
                </div>
                {overallProgress > 0 && (
                  <div className="w-full max-w-xs mx-auto space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Direct upload</span>
                      <span className="font-mono font-semibold text-primary">{overallProgress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-150"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Drop files or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-0.5">JPG · PNG · WebP · GIF · SVG · AVIF · MP4 · WebM · MOV — max 200 MB each</p>
                </div>
                <div className="text-xs text-primary font-semibold flex items-center gap-1.5 bg-primary/8 px-3 py-1.5 rounded-lg">
                  <Upload className="w-3 h-3" />
                  {value.length > 0 ? `Add more (${value.length}/${maxItems})` : "Choose files"}
                </div>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif,.mp4,.webm,.mov"
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Media gallery */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((item, idx) => (
            <div
              key={`${item.url}-${idx}`}
              className="flex items-center gap-3 p-2 rounded-lg border border-border/60 bg-card hover:border-primary/30 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-14 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                <MediaThumb item={item} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {getMediaIcon(item.mimeType)}
                  <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                </div>
                {idx === 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    Cover
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={idx === 0}
                  onClick={() => move(idx, "up")}
                  title="Move up"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={idx === value.length - 1}
                  onClick={() => move(idx, "down")}
                  title="Move down"
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => remove(idx)}
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
