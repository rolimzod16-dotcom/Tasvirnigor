import { Router, type IRouter } from "express";
import multer from "multer";
import { supabase } from "../lib/supabase";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

async function uploadToSupabase(
  bucket: string,
  file: Express.Multer.File
): Promise<string> {
  const ext = file.originalname.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

router.post(
  "/upload/project-banner",
  requireAdmin,
  upload.single("file"),
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }
    const url = await uploadToSupabase("project-banners", req.file);
    res.json({ url });
  }
);

router.post(
  "/upload/team-photo",
  requireAdmin,
  upload.single("file"),
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }
    const url = await uploadToSupabase("team-photos", req.file);
    res.json({ url });
  }
);

router.post(
  "/upload/partner-logo",
  requireAdmin,
  upload.single("file"),
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }
    const url = await uploadToSupabase("partner-logos", req.file);
    res.json({ url });
  }
);

export default router;
