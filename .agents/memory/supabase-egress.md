---
name: Supabase egress quota
description: Production Supabase Storage exceeded egress quota, breaking photo serving. Code-level workaround is an onError fallback on <img> tags.
---

## The rule
When Supabase Storage egress quota is exceeded, any image URLs from Supabase Storage buckets (`team-photos`, `project-banners`) stop loading in the browser. The API still serves the URLs (200 OK), but the images themselves return errors from Supabase CDN.

**Why:** Supabase free/paused plan enforces egress bandwidth limits. The deployment logs showed: `Storage upload failed: exceed_cached_egress_quota`.

**How to apply:**
- Always add `onError` fallback to `<img>` tags that load from Supabase Storage URLs.
- Inform user: they must upgrade Supabase plan or remove spend caps at supabase.com → project settings → billing.
- Do NOT switch away from Supabase Storage unless user explicitly requests it (user preference: Supabase Storage for uploads).
