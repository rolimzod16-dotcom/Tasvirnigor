import { Router, type IRouter } from "express";
import { AdminLoginBody, AdminLoginResponse, GetAdminMeResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD env var must be set");
}

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  (req as any).session.isAdmin = true;
  res.json(AdminLoginResponse.parse({ authenticated: true }));
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  (req as any).session.destroy((err: any) => {
    if (err) {
      req.log.error({ err }, "Session destroy error");
    }
  });
  res.sendStatus(204);
});

router.get("/admin/me", async (req, res): Promise<void> => {
  const session = (req as any).session;
  if (!session?.isAdmin) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(GetAdminMeResponse.parse({ authenticated: true }));
});

export default router;
