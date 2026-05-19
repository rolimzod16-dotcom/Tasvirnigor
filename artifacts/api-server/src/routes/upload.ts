import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { supabase } from "../lib/supabase";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

// ── Allowed file types ────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/gif", "image/svg+xml", "image/avif",
  "image/bmp", "image/x-bmp", "image/x-ms-bmp",
]);

const ALLOWED_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "svg", "avif", "bmp",
]);

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif", svg: "image/svg+xml",
  avif: "image/avif", bmp: "image/bmp",
};

// ── Multer ────────────────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 26 * 1024 * 1024 }, // 26 MB raw; user-facing limit is 25 MB
});

// ── Bucket auto-creation ──────────────────────────────────────────────────────

const readyBuckets = new Set<string>();

async function ensureBucket(bucket: string): Promise<void> {
  if (readyBuckets.has(bucket)) return;

  // Check if the bucket already exists
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    // Can't list — proceed anyway; upload will surface the real error
    return;
  }

  const exists = (buckets ?? []).some((b) => b.name === bucket);
  if (!exists) {
    const { error: createErr } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 26 * 1024 * 1024,
      allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
    });

    if (createErr && !createErr.message.toLowerCase().includes("already exists")) {
      throw new Error(`Cannot create storage bucket "${bucket}": ${createErr.message}`);
    }
  }

  readyBuckets.add(bucket);
}

// ── Validation helpers ────────────────────────────────────────────────────────

function validateImageFile(file: Express.Multer.File): string | null {
  const mime = file.mimetype.toLowerCase().split(";")[0].trim();
  const ext = (file.originalname.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(mime) && !ALLOWED_EXTENSIONS.has(ext)) {
    return `Unsupported file type. Allowed formats: JPG, PNG, WebP, GIF, SVG, AVIF, BMP.`;
  }
  return null;
}

function resolveContentType(file: Express.Multer.File): string {
  const mime = file.mimetype.toLowerCase().split(";")[0].trim();
  if (ALLOWED_MIME_TYPES.has(mime)) return mime;
  const ext = (file.originalname.split(".").pop() ?? "").toLowerCase();
  return EXT_TO_MIME[ext] ?? "image/jpeg";
}

// ── Core upload ───────────────────────────────────────────────────────────────

async function uploadToSupabase(bucket: string, file: Express.Multer.File): Promise<string> {
  await ensureBucket(bucket);

  const ext = (file.originalname.split(".").pop() ?? "jpg").toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const contentType = resolveContentType(file);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, file.buffer, { contentType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

// ── Route handler ─────────────────────────────────────────────────────────────

async function handleUpload(req: Request, res: Response, bucket: string): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: "No file provided. Please select an image file." });
    return;
  }
  const validationError = validateImageFile(req.file);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  try {
    const url = await uploadToSupabase(bucket, req.file);
    res.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
    req.log.error({ err, bucket }, "File upload error");
    res.status(500).json({ error: message });
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

router.post("/upload/project-banner", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  await handleUpload(req, res, "project-banners");
});

router.post("/upload/team-photo", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  await handleUpload(req, res, "team-photos");
});

router.post("/upload/partner-logo", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  await handleUpload(req, res, "partner-logos");
});

export default router;
