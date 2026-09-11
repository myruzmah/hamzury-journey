# Cloudinary Storage Setup for Hamzury

The Hamzury application uses **Cloudinary** for fast CDN storage of applicant transfer receipts and school placement letters.

---

## 1. Get Your Cloud Name

1. Log into your [Cloudinary Console](https://console.cloudinary.com/).
2. On your **Dashboard**, find your **Cloud Name** (e.g. `dxyz1234`).

---

## 2. Create an Unsigned Upload Preset

An unsigned preset allows the frontend to upload receipts directly without exposing your secret API keys:

1. Click on the **Settings** (gear icon) in Cloudinary.
2. Go to the **Upload** tab.
3. Scroll down to **Upload presets** and click **Add upload preset**.
4. Set **Signing Mode** to: **Unsigned**.
5. Set **Preset name** to something recognizable, like `hamzury_receipts` (or leave the auto-generated name).
6. (Optional) Set **Folder** to: `hamzury/applications`.
7. (Optional) In **Upload manipulations**, you can restrict allowed formats to `jpg,png,pdf`.
8. Click **Save**.

---

## 3. Configure Your Environment Variables

### Local Development (`.env`):
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

### Vercel Deployment:
1. In your [Vercel Dashboard](https://vercel.com), open your project.
2. Go to **Settings** -> **Environment Variables**.
3. Add:
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`
4. Redeploy.

---

## Graceful Fallback
If Cloudinary environment variables are left blank during testing, the app automatically falls back to client-side data URLs so testing and development are never interrupted!
