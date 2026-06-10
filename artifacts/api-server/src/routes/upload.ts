import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { supabase } from "../lib/supabase";
import { uploadBufferToCloudinary, signUploadParams } from "../lib/cloudinary";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

// ── File type sets ────────────────────────────────────────────────────────────

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/gif", "image/svg+xml", "image/avif",
  "image/bmp", "image/x-bmp", "image/x-ms-bmp",
]);

const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "svg", "avif", "bmp",
]);

const VIDEO_MIME_TYPES = new Set([
  "video/mp4", "video/webm", "video/quicktime",
  "video/x-msvideo", "video/x-matroska",
]);

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "avi", "mkv"]);

const SERVICE_MEDIA_MIME_TYPES = new Set([
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
  "application/json", "text/plain",
]);

const SERVICE_MEDIA_EXTENSIONS = new Set([
  ...IMAGE_EXTENSIONS,
  ...VIDEO_EXTENSIONS,
  "json",
]);

const VIDEO_EXT_TO_MIME: Record<string, string> = {
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  avi: "video/x-msvideo", mkv: "video/x-matroska",
};

const IMAGE_EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif", svg: "image/svg+xml",
  avif: "image/avif", bmp: "image/bmp",
};

const SERVICE_MEDIA_EXT_TO_MIME: Record<string, string> = {
  ...IMAGE_EXT_TO_MIME, ...VIDEO_EXT_TO_MIME,
  json: "application/json",
};

// ── Multer instances ──────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 26 * 1024 * 1024 },
});

const uploadLarge = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 215 * 1024 * 1024 },
});

// ── Supabase bucket helpers (for video / non-image uploads only) ──────────────

const readyBuckets = new Set<string>();

async function ensureBucket(bucket: string): Promise<void> {
  if (readyBuckets.has(bucket)) return;
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) return;
  const exists = (buckets ?? []).some((b) => b.name === bucket);
  if (!exists) {
    const { error: createErr } = await supabase.storage.createBucket(bucket, { public: true });
    if (createErr) {
      const msg = createErr.message.toLowerCase();
      if (!msg.includes("already exists") && !msg.includes("duplicate")) {
        throw new Error(`Cannot create storage bucket "${bucket}": ${createErr.message}`);
      }
    }
  }
  readyBuckets.add(bucket);
}

async function uploadToSupabase(
  bucket: string,
  file: Express.Multer.File,
  extToMime: Record<string, string>,
  allowedMimes: Set<string>,
  fallbackMime: string
): Promise<string> {
  const ext = (file.originalname.split(".").pop() ?? "bin").toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const mime = file.mimetype.toLowerCase().split(";")[0].trim();
  const contentType = allowedMimes.has(mime) ? mime : (extToMime[ext] ?? fallbackMime);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, file.buffer, { contentType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

// ── Validation helper ─────────────────────────────────────────────────────────

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

function isImageFile(file: Express.Multer.File): boolean {
  const mime = file.mimetype.toLowerCase().split(";")[0].trim();
  const ext = (file.originalname.split(".").pop() ?? "").toLowerCase();
  return IMAGE_MIME_TYPES.has(mime) || IMAGE_EXTENSIONS.has(ext);
}

// ── Core image upload → Cloudinary ────────────────────────────────────────────

async function uploadImageToCloudinary(file: Express.Multer.File, folder: string): Promise<string> {
  const result = await uploadBufferToCloudinary(file.buffer, folder, file.originalname);
  return result.secure_url;
}

// ── Shared image-upload handler ───────────────────────────────────────────────

async function handleImageUpload(req: Request, res: Response, folder: string): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: "No file provided. Please select a file." });
    return;
  }
  const validationError = validateFile(
    req.file, IMAGE_MIME_TYPES, IMAGE_EXTENSIONS,
    "JPG, PNG, WebP, GIF, SVG, AVIF, BMP"
  );
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  try {
    const url = await uploadImageToCloudinary(req.file, folder);
    res.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
    req.log.error({ err, folder }, "Cloudinary image upload error");
    res.status(500).json({ error: message });
  }
}

// ── Routes — images (all → Cloudinary) ───────────────────────────────────────

router.post("/upload/project-banner", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  await handleImageUpload(req, res, "project-banners");
});

router.post("/upload/team-photo", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  await handleImageUpload(req, res, "team-photos");
});

router.post("/upload/comic-cover", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  await handleImageUpload(req, res, "comic-covers");
});

router.post("/upload/comic-page", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  await handleImageUpload(req, res, "comic-pages");
});

router.post("/upload/partner-logo", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  await handleImageUpload(req, res, "partner-logos");
});

router.post("/upload/hero-image", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  await handleImageUpload(req, res, "hero-images");
});

// ── Routes — mixed media (images → Cloudinary, video/lottie → Supabase) ───────

router.post("/upload/service-media", requireAdmin, uploadLarge.single("file"), async (req, res): Promise<void> => {
  const bucket = "service-media";
  if (!req.file) {
    res.status(400).json({ error: "No file provided. Please select a file." });
    return;
  }
  const validationError = validateFile(
    req.file, SERVICE_MEDIA_MIME_TYPES, SERVICE_MEDIA_EXTENSIONS,
    "JPG, PNG, WebP, GIF, SVG, AVIF, MP4, WebM, MOV, JSON (Lottie)"
  );
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const mime = req.file.mimetype.toLowerCase().split(";")[0].trim();
  const ext = (req.file.originalname.split(".").pop() ?? "").toLowerCase();
  let mediaType: "image" | "gif" | "video" | "lottie" = "image";
  if (mime.startsWith("video/") || VIDEO_EXTENSIONS.has(ext)) mediaType = "video";
  else if (mime === "image/gif" || ext === "gif") mediaType = "gif";
  else if (mime === "application/json" || ext === "json") mediaType = "lottie";

  try {
    let url: string;
    if (isImageFile(req.file)) {
      url = await uploadImageToCloudinary(req.file, bucket);
    } else {
      await ensureBucket(bucket);
      url = await uploadToSupabase(bucket, req.file, SERVICE_MEDIA_EXT_TO_MIME, SERVICE_MEDIA_MIME_TYPES, "application/octet-stream");
    }
    res.json({ url, mediaType });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
    req.log.error({ err, bucket }, "Service media upload error");
    res.status(500).json({ error: message });
  }
});

router.post("/upload/project-media", requireAdmin, uploadLarge.single("file"), async (req, res): Promise<void> => {
  const bucket = "project-media";
  if (!req.file) {
    res.status(400).json({ error: "No file provided. Please select a file." });
    return;
  }
  const validationError = validateFile(
    req.file, SERVICE_MEDIA_MIME_TYPES, SERVICE_MEDIA_EXTENSIONS,
    "JPG, PNG, WebP, GIF, SVG, AVIF, MP4, WebM, MOV"
  );
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const mime = req.file.mimetype.toLowerCase().split(";")[0].trim();
  const ext = (req.file.originalname.split(".").pop() ?? "").toLowerCase();
  let mediaType: "image" | "gif" | "video" = "image";
  if (mime.startsWith("video/") || VIDEO_EXTENSIONS.has(ext)) mediaType = "video";
  else if (mime === "image/gif" || ext === "gif") mediaType = "gif";

  try {
    let url: string;
    let mimeType: string;
    if (isImageFile(req.file)) {
      url = await uploadImageToCloudinary(req.file, bucket);
      mimeType = IMAGE_EXT_TO_MIME[ext] ?? mime;
    } else {
      await ensureBucket(bucket);
      url = await uploadToSupabase(bucket, req.file, SERVICE_MEDIA_EXT_TO_MIME, SERVICE_MEDIA_MIME_TYPES, "application/octet-stream");
      mimeType = VIDEO_EXT_TO_MIME[ext] ?? mime;
    }
    res.json({ url, mediaType, mimeType });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
    req.log.error({ err, bucket }, "Project media upload error");
    res.status(500).json({ error: message });
  }
});

// ── Route — hero video (stays on Supabase — large video, not image) ───────────

router.post("/upload/hero-video", requireAdmin, uploadLarge.single("file"), async (req, res): Promise<void> => {
  const bucket = "hero-videos";
  const VIDEO_HERO_MIME = new Set([
    "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska",
    "image/gif",
  ]);
  const VIDEO_HERO_EXT = new Set(["mp4", "webm", "mov", "avi", "mkv", "gif"]);
  const VIDEO_HERO_EXT_TO_MIME: Record<string, string> = {
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
    avi: "video/x-msvideo", mkv: "video/x-matroska", gif: "image/gif",
  };
  if (!req.file) {
    res.status(400).json({ error: "No file provided." });
    return;
  }
  const validationError = validateFile(req.file, VIDEO_HERO_MIME, VIDEO_HERO_EXT, "MP4, WebM, MOV, GIF");
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  try {
    await ensureBucket(bucket);
    const url = await uploadToSupabase(bucket, req.file, VIDEO_HERO_EXT_TO_MIME, VIDEO_HERO_MIME, "video/mp4");
    res.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    req.log.error({ err, bucket }, "Hero video upload error");
    res.status(500).json({ error: message });
  }
});

// ── Cloudinary signed-upload URL (direct browser → Cloudinary) ───────────────
//
// Returns the params the browser needs to POST a file directly to Cloudinary's
// upload endpoint, bypassing our server for the actual bytes.
// The server still validates the admin session before issuing the signature.

const CLOUDINARY_IMAGE_FOLDERS = new Set([
  "hero-images", "project-media", "project-banners",
  "service-media", "team-photos",
  "comic-covers", "comic-pages",
  "partner-logos",
]);

router.post("/upload/cloudinary-sign", requireAdmin, async (req, res): Promise<void> => {
  const { folder } = req.body as { folder?: string };

  if (!folder || !CLOUDINARY_IMAGE_FOLDERS.has(folder)) {
    res.status(400).json({ error: "Invalid or missing folder" });
    return;
  }

  try {
    const params = signUploadParams(folder);
    res.json(params);
  } catch (err) {
    req.log.error({ err }, "Cloudinary sign error");
    res.status(500).json({ error: "Failed to create upload signature" });
  }
});

// ── Supabase signed-upload URL (direct browser → Supabase, for videos) ────────

const SUPABASE_VIDEO_BUCKETS = new Set([
  "hero-videos", "project-media", "service-media",
]);

router.post("/upload/signed-url", requireAdmin, async (req, res): Promise<void> => {
  const { bucket, ext } = req.body as { bucket?: string; ext?: string };

  if (!bucket || !SUPABASE_VIDEO_BUCKETS.has(bucket)) {
    res.status(400).json({ error: "Invalid or missing bucket" });
    return;
  }

  const safeExt = (ext ?? "bin").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;

  try {
    await ensureBucket(bucket);

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filename);

    if (error || !data) {
      req.log.error({ error }, "createSignedUploadUrl failed");
      res.status(500).json({ error: error?.message ?? "Could not create upload URL" });
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename);
    res.json({ signedUrl: data.signedUrl, token: data.token, path: data.path, publicUrl });
  } catch (err) {
    req.log.error({ err }, "Signed URL creation error");
    res.status(500).json({ error: "Failed to create upload URL" });
  }
});

export default router;
