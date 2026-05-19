import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { supabase } from "../lib/supabase";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "image/bmp",
  "image/x-bmp",
  "image/x-ms-bmp",
]);

const ALLOWED_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "svg", "avif", "bmp",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 26 * 1024 * 1024 },
});

function validateImageFile(file: Express.Multer.File): string | null {
  const mime = file.mimetype.toLowerCase().split(";")[0].trim();
  const ext = (file.originalname.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(mime) && !ALLOWED_EXTENSIONS.has(ext)) {
    return `Invalid file type "${mime}". Allowed: JPG, PNG, WebP, GIF, SVG, AVIF, BMP.`;
  }
  return null;
}

function resolveContentType(file: Express.Multer.File): string {
  const mime = file.mimetype.toLowerCase().split(";")[0].trim();
  if (ALLOWED_MIME_TYPES.has(mime)) return mime;
  const ext = (file.originalname.split(".").pop() ?? "").toLowerCase();
  const extMap: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    webp: "image/webp", gif: "image/gif", svg: "image/svg+xml",
    avif: "image/avif", bmp: "image/bmp",
  };
  return extMap[ext] ?? "image/jpeg";
}

async function uploadToSupabase(bucket: string, file: Express.Multer.File): Promise<string> {
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
    const message = err instanceof Error ? err.message : "Upload failed";
    req.log.error({ err, bucket }, "File upload error");
    res.status(500).json({ error: message });
  }
}

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
