export type UploadProgressCallback = (pct: number) => void;

/**
 * Upload a file directly from the browser to Replit Object Storage.
 *
 * Flow:
 *  1. Ask the API server for a short-lived GCS presigned PUT URL (admin session validated).
 *  2. PUT the file straight to GCS via XHR — bypasses the Replit proxy, so no
 *     proxy timeout, no body-size limit, and real per-byte upload progress.
 *
 * Works for any file type (images, videos, JSON/Lottie, etc.).
 *
 * @param file         The File object to upload.
 * @param folder       Storage folder name (e.g. "team-photos", "project-media").
 *                     Use `bucketFromEndpoint()` to derive from an upload endpoint path.
 * @param onProgress   Optional 0-100 progress callback.
 * @returns            The serving URL to store in the database.
 */
export async function uploadDirect(
  file: File,
  folder: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  // Step 1 — get a presigned PUT URL from our server (checks admin session)
  const sigRes = await fetch("/api/upload/presigned-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  if (!sigRes.ok) {
    const err = await sigRes.json().catch(() => ({ error: sigRes.statusText }));
    throw new Error((err as { error?: string }).error ?? "Failed to get upload URL");
  }

  const { uploadUrl, serveUrl } = (await sigRes.json()) as {
    uploadUrl: string;
    serveUrl: string;
  };

  // Step 2 — PUT the file directly to GCS (bypasses Replit proxy entirely)
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
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

  return serveUrl;
}

/**
 * Map an upload endpoint path to its Object Storage folder name.
 * Returns null for unknown/custom endpoints (caller should fall back to
 * a proxied server upload).
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
