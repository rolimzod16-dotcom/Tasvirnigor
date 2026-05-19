import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { supabase } from "../lib/supabase";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

// ── Allowed file types (images) ───────────────────────────────────────────────

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/gif", "image/svg+xml", "image/avif",
  "image/bmp", "image/x-bmp", "image/x-ms-bmp",
]);

const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "svg", "avif", "bmp",
]);

// ── Allowed file types (service media: images + video + Lottie JSON) ──────────

const SERVICE_MEDIA_MIME_TYPES = new Set([
  ...IMAGE_MIME_TYPES,
  "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo",
  "video/x-matroska",
  "application/json", "text/plain",
]);

const SERVICE_MEDIA_EXTENSIONS = new Set([
  ...IMAGE_EXTENSIONS,
  "mp4", "webm", "mov", "avi", "mkv", "json",
]);

const IMAGE_EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif", svg: "image/svg+xml",
  avif: "image/avif", bmp: "image/bmp",
};

const SERVICE_MEDIA_EXT_TO_MIME: Record<string, string> = {
  ...IMAGE_EXT_TO_MIME,
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  avi: "video/x-msvideo", mkv: "video/x-matroska",
  json: "application/json",
};

// ── Multer instances ──────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 26 * 1024 * 1024 }, // 26 MB raw; user-facing limit is 25 MB
});

const uploadLarge = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 102 * 1024 * 1024 }, // 102 MB raw; user-facing limit is 100 MB
});

// ── Bucket auto-creation ──────────────────────────────────────────────────────

const readyBuckets = new Set<string>();

async function ensureBucket(
  bucket: string,
  allowedMimeTypes: string[],
  fileSizeLimit: number
): Promise<void> {
  if (readyBuckets.has(bucket)) return;

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) return; // Can't list — proceed; upload will surface the real error

  const exists = (buckets ?? []).some((b) => b.name === bucket);
  if (!exists) {
    const { error: createErr } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit,
      allowedMimeTypes,
    });

    if (createErr && !createErr.message.toLowerCase().includes("already exists")) {
      throw new Error(`Cannot create storage bucket "${bucket}": ${createErr.message}`);
    }
  }

  readyBuckets.add(bucket);
}

// ── Validation helpers ────────────────────────────────────────────────────────

function validateFile(
  file: Express.Multer.File,
  allowedMimes: Set<string>,
  allowedExts: Set<string>,
  label: string
): string | null {
  const mime = file.mimetype.toLowerCase().split(";")[0].trim();
  const ext = (file.originalname.split(".").pop() ?? "").toLowerCase();
  if (!allowedMimes.has(mime) && !allowedExts.has(ext)) {
    return `Unsupported file type. Allowed formats: ${label}.`;
  }
  return null;
}

function resolveContentType(
  file: Express.Multer.File,
  extToMime: Record<string, string>,
  allowedMimes: Set<string>,
  fallback: string
): string {
  const mime = file.mimetype.toLowerCase().split(";")[0].trim();
  if (allowedMimes.has(mime)) return mime;
  const ext = (file.originalname.split(".").pop() ?? "").toLowerCase();
  return extToMime[ext] ?? fallback;
}

// ── Core upload ───────────────────────────────────────────────────────────────

async function uploadToSupabase(
  bucket: string,
  file: Express.Multer.File,
  extToMime: Record<string, string>,
  allowedMimes: Set<string>,
  fallbackMime: string
): Promise<string> {
  const ext = (file.originalname.split(".").pop() ?? "jpg").toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const contentType = resolveContentType(file, extToMime, allowedMimes, fallbackMime);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, file.buffer, { contentType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

// ── Image route handler ───────────────────────────────────────────────────────

async function handleImageUpload(req: Request, res: Response, bucket: string): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: "No file provided. Please select a file." });
    return;
  }
  const validationError = validateFile(
    req.file,
    IMAGE_MIME_TYPES,
    IMAGE_EXTENSIONS,
    "JPG, PNG, WebP, GIF, SVG, AVIF, BMP"
  );
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  try {
    await ensureBucket(bucket, Array.from(IMAGE_MIME_TYPES), 26 * 1024 * 1024);
    const url = await uploadToSupabase(bucket, req.file, IMAGE_EXT_TO_MIME, IMAGE_MIME_TYPES, "image/jpeg");
    res.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
    req.log.error({ err, bucket }, "File upload error");
    res.status(500).json({ error: message });
  }
}

// ── Service media route handler ───────────────────────────────────────────────

async function handleServiceMediaUpload(req: Request, res: Response): Promise<void> {
  const bucket = "service-media";
  if (!req.file) {
    res.status(400).json({ error: "No file provided. Please select a file." });
    return;
  }
  const validationError = validateFile(
    req.file,
    SERVICE_MEDIA_MIME_TYPES,
    SERVICE_MEDIA_EXTENSIONS,
    "JPG, PNG, WebP, GIF, SVG, AVIF, MP4, WebM, MOV, JSON (Lottie)"
  );
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  // Detect media type for the response
  const mime = req.file.mimetype.toLowerCase().split(";")[0].trim();
  const ext = (req.file.originalname.split(".").pop() ?? "").toLowerCase();
  let mediaType: "image" | "gif" | "video" | "lottie" = "image";
  if (mime.startsWith("video/") || ["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) {
    mediaType = "video";
  } else if (mime === "image/gif" || ext === "gif") {
    mediaType = "gif";
  } else if (mime === "application/json" || ext === "json") {
    mediaType = "lottie";
  }

  try {
    await ensureBucket(bucket, Array.from(SERVICE_MEDIA_MIME_TYPES), 102 * 1024 * 1024);
    const url = await uploadToSupabase(
      bucket,
      req.file,
      SERVICE_MEDIA_EXT_TO_MIME,
      SERVICE_MEDIA_MIME_TYPES,
      "application/octet-stream"
    );
    res.json({ url, mediaType });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
    req.log.error({ err, bucket }, "Service media upload error");
    res.status(500).json({ error: message });
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

router.post("/upload/project-banner", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  await handleImageUpload(req, res, "project-banners");
});

router.post("/upload/team-photo", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  await handleImageUpload(req, res, "team-photos");
});

router.post("/upload/partner-logo", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  await handleImageUpload(req, res, "partner-logos");
});

router.post("/upload/service-media", requireAdmin, uploadLarge.single("file"), async (req, res): Promise<void> => {
  await handleServiceMediaUpload(req, res);
});

export default router;
