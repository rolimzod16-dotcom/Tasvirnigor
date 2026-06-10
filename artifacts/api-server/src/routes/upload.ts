import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { requireAdmin } from "../middlewares/auth";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

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

const MEDIA_MIME_TYPES = new Set([
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
  "application/json", "text/plain",
]);

const MEDIA_EXTENSIONS = new Set([
  ...IMAGE_EXTENSIONS,
  ...VIDEO_EXTENSIONS,
  "json",
]);

const IMAGE_EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif", svg: "image/svg+xml",
  avif: "image/avif", bmp: "image/bmp",
};

const VIDEO_EXT_TO_MIME: Record<string, string> = {
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  avi: "video/x-msvideo", mkv: "video/x-matroska",
};

const MEDIA_EXT_TO_MIME: Record<string, string> = {
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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function getContentType(file: Express.Multer.File, extToMime: Record<string, string>): string {
  const mime = file.mimetype.toLowerCase().split(";")[0].trim();
  const ext = (file.originalname.split(".").pop() ?? "").toLowerCase();
  return mime !== "application/octet-stream" ? mime : (extToMime[ext] ?? "application/octet-stream");
}

/** Upload a file buffer to Object Storage and return the serving URL. */
async function storeFile(file: Express.Multer.File, folder: string, extToMime: Record<string, string> = IMAGE_EXT_TO_MIME): Promise<string> {
  const contentType = getContentType(file, extToMime);
  const objectPath = await objectStorageService.uploadBuffer(file.buffer, contentType, folder);
  return `/api/storage${objectPath}`;
}

// ── Shared image-upload handler ───────────────────────────────────────────────

async function handleImageUpload(req: Request, res: Response, folder: string): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: "No file provided. Please select a file." });
    return;
  }
  const err = validateFile(req.file, IMAGE_MIME_TYPES, IMAGE_EXTENSIONS, "JPG, PNG, WebP, GIF, SVG, AVIF, BMP");
  if (err) { res.status(400).json({ error: err }); return; }

  try {
    const url = await storeFile(req.file, folder);
    res.json({ url });
  } catch (error) {
    req.log.error({ err: error, folder }, "Image upload error");
    res.status(500).json({ error: "Upload failed. Please try again." });
  }
}

// ── Routes — image-only uploads ───────────────────────────────────────────────

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

// ── Routes — mixed media (images + videos + lottie) ──────────────────────────

router.post("/upload/service-media", requireAdmin, uploadLarge.single("file"), async (req, res): Promise<void> => {
  if (!req.file) { res.status(400).json({ error: "No file provided." }); return; }

  const err = validateFile(req.file, MEDIA_MIME_TYPES, MEDIA_EXTENSIONS, "JPG, PNG, WebP, GIF, SVG, AVIF, MP4, WebM, MOV, JSON (Lottie)");
  if (err) { res.status(400).json({ error: err }); return; }

  const mime = req.file.mimetype.toLowerCase().split(";")[0].trim();
  const ext = (req.file.originalname.split(".").pop() ?? "").toLowerCase();
  let mediaType: "image" | "gif" | "video" | "lottie" = "image";
  if (mime.startsWith("video/") || VIDEO_EXTENSIONS.has(ext)) mediaType = "video";
  else if (mime === "image/gif" || ext === "gif") mediaType = "gif";
  else if (mime === "application/json" || ext === "json") mediaType = "lottie";

  try {
    const url = await storeFile(req.file, "service-media", MEDIA_EXT_TO_MIME);
    res.json({ url, mediaType });
  } catch (error) {
    req.log.error({ err: error }, "Service media upload error");
    res.status(500).json({ error: "Upload failed. Please try again." });
  }
});

router.post("/upload/project-media", requireAdmin, uploadLarge.single("file"), async (req, res): Promise<void> => {
  if (!req.file) { res.status(400).json({ error: "No file provided." }); return; }

  const err = validateFile(req.file, MEDIA_MIME_TYPES, MEDIA_EXTENSIONS, "JPG, PNG, WebP, GIF, SVG, AVIF, MP4, WebM, MOV");
  if (err) { res.status(400).json({ error: err }); return; }

  const mime = req.file.mimetype.toLowerCase().split(";")[0].trim();
  const ext = (req.file.originalname.split(".").pop() ?? "").toLowerCase();
  let mediaType: "image" | "gif" | "video" = "image";
  if (mime.startsWith("video/") || VIDEO_EXTENSIONS.has(ext)) mediaType = "video";
  else if (mime === "image/gif" || ext === "gif") mediaType = "gif";

  const mimeType = getContentType(req.file, MEDIA_EXT_TO_MIME);

  try {
    const url = await storeFile(req.file, "project-media", MEDIA_EXT_TO_MIME);
    res.json({ url, mediaType, mimeType });
  } catch (error) {
    req.log.error({ err: error }, "Project media upload error");
    res.status(500).json({ error: "Upload failed. Please try again." });
  }
});

router.post("/upload/hero-video", requireAdmin, uploadLarge.single("file"), async (req, res): Promise<void> => {
  const VIDEO_HERO_MIME = new Set([
    "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska", "image/gif",
  ]);
  const VIDEO_HERO_EXT = new Set(["mp4", "webm", "mov", "avi", "mkv", "gif"]);

  if (!req.file) { res.status(400).json({ error: "No file provided." }); return; }

  const err = validateFile(req.file, VIDEO_HERO_MIME, VIDEO_HERO_EXT, "MP4, WebM, MOV, GIF");
  if (err) { res.status(400).json({ error: err }); return; }

  try {
    const url = await storeFile(req.file, "hero-videos", { ...VIDEO_EXT_TO_MIME, gif: "image/gif" });
    res.json({ url });
  } catch (error) {
    req.log.error({ err: error }, "Hero video upload error");
    res.status(500).json({ error: "Upload failed. Please try again." });
  }
});

// ── Presigned URL endpoint (browser → GCS direct upload) ─────────────────────
//
// The browser requests a short-lived GCS presigned PUT URL.
// The admin session is validated server-side; the file bytes never pass through
// our server. The browser PUTs directly to GCS, then stores the returned serveUrl.

const ALLOWED_FOLDERS = new Set([
  "team-photos", "project-banners", "comic-covers", "comic-pages",
  "partner-logos", "hero-images", "hero-videos", "service-media", "project-media",
]);

router.post("/upload/presigned-url", requireAdmin, async (req, res): Promise<void> => {
  const { folder } = req.body as { folder?: string };

  if (!folder || !ALLOWED_FOLDERS.has(folder)) {
    res.status(400).json({ error: "Invalid or missing folder" });
    return;
  }

  try {
    const { uploadUrl, objectPath } = await objectStorageService.getPresignedUploadUrl(folder);
    const serveUrl = `/api/storage${objectPath}`;
    res.json({ uploadUrl, serveUrl });
  } catch (error) {
    req.log.error({ err: error }, "Presigned URL generation error");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

export default router;
