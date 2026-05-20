export type UploadProgressCallback = (pct: number) => void;

/**
 * Upload a file directly from the browser to Supabase Storage.
 *
 * Flow:
 *  1. Call our server to get a short-lived signed upload URL (admin session validated).
 *  2. PUT the file straight to Supabase via XHR (never passes through the Replit proxy,
 *     so there is no proxy timeout, no 100 MB body limit, and real upload progress).
 *
 * @param file     The File object to upload.
 * @param bucket   Supabase storage bucket name (must be in the server's allowlist).
 * @param onProgress  Optional callback called with 0-100 upload percentage.
 * @returns        The public URL of the uploaded file.
 */
export async function uploadDirect(
  file: File,
  bucket: string,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "bin")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 10);

  // Step 1 — get a signed PUT URL from our server (checks admin session)
  const sigRes = await fetch("/api/upload/signed-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket, ext }),
  });

  if (!sigRes.ok) {
    const err = await sigRes.json().catch(() => ({ error: sigRes.statusText }));
    throw new Error(err.error ?? "Failed to get upload URL");
  }

  const { signedUrl, publicUrl } = (await sigRes.json()) as {
    signedUrl: string;
    publicUrl: string;
  };

  // Step 2 — PUT the file directly to Supabase (bypasses Replit proxy entirely)
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.timeout = 30 * 60 * 1000; // 30-minute hard cap

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed with status ${xhr.status}`));

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timed out after 30 minutes"));

    xhr.send(file);
  });

  return publicUrl;
}

/**
 * Map a legacy proxied-upload endpoint path to its Supabase bucket name.
 * Returns null for unknown/custom endpoints (caller should fall back to proxied upload).
 */
export function bucketFromEndpoint(endpoint: string): string | null {
  const MAP: Record<string, string> = {
    "/api/upload/service-media": "service-media",
    "/api/upload/project-media": "project-media",
    "/api/upload/hero-video": "hero-videos",
    "/api/upload/hero-image": "hero-images",
    "/api/upload/team-photo": "team-photos",
    "/api/upload/project-banner": "project-banners",
    "/api/upload/comic-cover": "comic-covers",
    "/api/upload/comic-page": "comic-pages",
    "/api/upload/partner-logo": "partner-logos",
  };
  return MAP[endpoint] ?? null;
}
