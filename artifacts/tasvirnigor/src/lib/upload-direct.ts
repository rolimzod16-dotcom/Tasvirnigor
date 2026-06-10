export type UploadProgressCallback = (pct: number) => void;

// ── Helpers ───────────────────────────────────────────────────────────────────

function isVideoFile(file: File): boolean {
  const mime = file.type.toLowerCase();
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  return (
    mime.startsWith("video/") ||
    ["mp4", "webm", "mov", "avi", "mkv"].includes(ext)
  );
}

// ── Cloudinary direct upload (images) ────────────────────────────────────────
//
// Flow:
//  1. Ask our server for a signed set of params (admin session validated).
//  2. POST the file directly to Cloudinary via XHR — never passes through the
//     Replit proxy, so no proxy timeout and real upload progress.

async function uploadDirectCloudinary(
  file: File,
  folder: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  const sigRes = await fetch("/api/upload/cloudinary-sign", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  if (!sigRes.ok) {
    const err = await sigRes.json().catch(() => ({ error: sigRes.statusText }));
    throw new Error((err as { error?: string }).error ?? "Failed to get upload signature");
  }

  const { signature, timestamp, apiKey, cloudName, folder: signedFolder } =
    (await sigRes.json()) as {
      signature: string;
      timestamp: number;
      apiKey: string;
      cloudName: string;
      folder: string;
    };

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", signedFolder);

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    xhr.timeout = 30 * 60 * 1000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText) as { secure_url?: string; error?: { message?: string } };
          if (result.secure_url) {
            resolve(result.secure_url);
          } else {
            reject(new Error(result.error?.message ?? "Cloudinary returned no URL"));
          }
        } catch {
          reject(new Error("Invalid response from Cloudinary"));
        }
      } else {
        reject(new Error(`Cloudinary upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timed out after 30 minutes"));

    xhr.send(formData);
  });
}

// ── Supabase direct upload (videos / non-image files) ────────────────────────
//
// Flow:
//  1. Call our server to get a short-lived signed upload URL.
//  2. PUT the file straight to Supabase via XHR.

async function uploadDirectSupabase(
  file: File,
  bucket: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "bin")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 10);

  const sigRes = await fetch("/api/upload/signed-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket, ext }),
  });

  if (!sigRes.ok) {
    const err = await sigRes.json().catch(() => ({ error: sigRes.statusText }));
    throw new Error((err as { error?: string }).error ?? "Failed to get upload URL");
  }

  const { signedUrl, publicUrl } = (await sigRes.json()) as {
    signedUrl: string;
    publicUrl: string;
  };

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.timeout = 30 * 60 * 1000;

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

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Upload a file directly from the browser, bypassing the Replit proxy.
 *
 * - Image files → Cloudinary (signed upload, progress tracking).
 * - Video / non-image files → Supabase Storage (signed PUT URL).
 *
 * @param file          The File object to upload.
 * @param destination   Cloudinary folder name **or** Supabase bucket name.
 *                      Use `folderFromEndpoint()` to derive it from the upload endpoint path.
 * @param onProgress    Optional 0-100 progress callback.
 * @returns             The public URL of the uploaded file.
 */
export async function uploadDirect(
  file: File,
  destination: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (isVideoFile(file)) {
    return uploadDirectSupabase(file, destination, onProgress);
  }
  return uploadDirectCloudinary(file, destination, onProgress);
}

/**
 * Map an upload endpoint path to its Cloudinary folder / Supabase bucket name.
 * Returns null for unknown/custom endpoints (caller should fall back to a
 * proxied server upload).
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
