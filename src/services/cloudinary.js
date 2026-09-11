/* ============================================================
   CLOUDINARY STORAGE SERVICE
   Direct unsigned uploads for receipts and school letters
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
 * Uploads a file directly to Cloudinary with real-time progress reporting
 * @param {File} file - The file to upload
 * @param {string} folder - Destination folder (e.g. hamzury/applications/HMZ-2026-XXXXX)
 * @param {function} onProgress - Progress callback (percentage: 0-100)
 * @returns {Promise<string>} Cloudinary secure_url
 */
export function uploadToCloudinary(file, folder = "hamzury/applications", onProgress = null) {
  return new Promise((resolve, reject) => {
    // If Cloudinary credentials are not yet set in .env, fallback to Base64 data URL
    if (!isCloudinaryConfigured()) {
      console.warn(
        "[Cloudinary] Cloud name or upload preset not set in .env. Falling back to local data URL. See CLOUDINARY_SETUP.md."
      );
      if (onProgress) onProgress(50);
      const reader = new FileReader();
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
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

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          console.info("[Cloudinary] Upload success:", response.secure_url);
          if (onProgress) onProgress(100);
          resolve(response.secure_url);
        } catch (e) {
          reject(e);
        }
      } else {
        console.error("[Cloudinary] Upload failed with status", xhr.status, xhr.responseText);
        // Fallback to data URL on preset misconfiguration so user is never blocked
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      }
    };

    xhr.onerror = () => {
      console.error("[Cloudinary] Network error, falling back to data URL");
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    };

    xhr.send(formData);
  });
}
