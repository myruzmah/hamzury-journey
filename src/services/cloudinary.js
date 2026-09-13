/* ============================================================
   CLOUDINARY STORAGE SERVICE
   Direct unsigned uploads for receipts and school letters

   On failure this rejects rather than resolving with a base64
   data URL. A data URL is not durable storage: it is far too
   large for a Firestore document (1MiB limit) and previously
   caused the whole application write to fail silently.
   ============================================================ */
const env = import.meta.env || {};

export const cloudinaryConfig = {
  cloudName: env.VITE_CLOUDINARY_CLOUD_NAME || "",
  uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET || ""
};

/**
 * Checks if Cloudinary is configured
 */
export const isCloudinaryConfigured = () => {
  return Boolean(cloudinaryConfig.cloudName && cloudinaryConfig.uploadPreset);
};

/**
 * Uploads a file directly to Cloudinary with real-time progress reporting.
 * @param {File} file - The file to upload
 * @param {string} folder - Destination folder (e.g. hamzury/applications/HMZ-2026-XXXXX)
 * @param {function} onProgress - Progress callback (percentage: 0-100)
 * @returns {Promise<string>} Cloudinary secure_url
 */
export function uploadToCloudinary(file, folder = "hamzury/applications", onProgress = null) {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      reject(
        new Error(
          "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET. See CLOUDINARY_SETUP.md."
        )
      );
      return;
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);
    if (folder) {
      formData.append("folder", folder);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    // An upload must not hang forever and block the applicant.
    xhr.timeout = 120000;

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (!response.secure_url) {
            reject(new Error("Cloudinary response contained no secure_url"));
            return;
          }
          console.info("[Cloudinary] Upload success:", response.secure_url);
          if (onProgress) onProgress(100);
          resolve(response.secure_url);
        } catch (e) {
          reject(e);
        }
      } else {
        console.error("[Cloudinary] Upload failed with status", xhr.status, xhr.responseText);
        reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during Cloudinary upload"));
    xhr.ontimeout = () => reject(new Error("Cloudinary upload timed out"));
    xhr.onabort = () => reject(new Error("Cloudinary upload aborted"));

    xhr.send(formData);
  });
}
