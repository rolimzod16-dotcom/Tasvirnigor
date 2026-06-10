---
name: Object Storage upload system
description: All admin file uploads use Replit Object Storage (GCS). No Cloudinary, no Supabase Storage.
---

## Rule
All image and video uploads go to Replit Object Storage (GCS) via the sidecar-authenticated client. No external storage providers (Cloudinary, Supabase Storage) should be added.

**Why:** User explicitly asked to remove Cloudinary and Supabase Storage; Supabase had egress quota issues in production. Replit Object Storage is the only storage dependency.

**How to apply:**
- Server-proxied uploads (FileUpload component): multer → `objectStorageService.uploadBuffer(buffer, contentType, folder)` → returns `/objects/uploads/<folder>/<uuid>` → store as `/api/storage/objects/uploads/<folder>/<uuid>` in DB.
- Direct browser uploads (MediaUpload / MultiMediaUpload): call `POST /api/upload/presigned-url` with `{ folder }` → get `{ uploadUrl, serveUrl }` → XHR PUT file directly to GCS → store `serveUrl` in DB.
- Serving: `GET /api/storage/objects/*` streams from GCS. Public — no auth required (images displayed on public site).

## Key files
- `artifacts/api-server/src/lib/objectStorage.ts` — GCS client + `uploadBuffer()` + `getPresignedUploadUrl(folder)`
- `artifacts/api-server/src/lib/objectAcl.ts` — ACL framework (copied from skill template, not customized)
- `artifacts/api-server/src/routes/upload.ts` — all upload endpoints
- `artifacts/api-server/src/routes/storage.ts` — serving endpoints (`/storage/objects/*`, `/storage/public-objects/*`)
- `artifacts/tasvirnigor/src/lib/upload-direct.ts` — browser XHR direct-to-GCS via presigned URL
