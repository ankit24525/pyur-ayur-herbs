"use client";

// High-efficiency WebP exporter: compresses user review images to lightweight WebP
export const compressImageToDataUrl = (file: File, maxDim = 1200, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(img.src);
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const webp = canvas.toDataURL("image/webp", quality);
          if (webp && webp.startsWith("data:image/webp")) return resolve(webp);
        } catch {}
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Upload review photo to Cloudinary CDN via /api/admin/upload with automatic fallback
export const uploadReviewImage = async (file: File): Promise<string> => {
  try {
    // 1. Compress first to reduce upload size and network load
    const compressedDataUrl = await compressImageToDataUrl(file, 1000, 0.82);

    // 2. Upload to Cloudinary CDN
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: compressedDataUrl, folder: "pure_ayur_reviews" }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.url) return data.url;
    }

    // 3. Fallback to lightweight compressed data URL if CDN upload fails
    return compressedDataUrl;
  } catch (err) {
    console.warn("Upload error, using compressed data URL fallback:", err);
    try {
      return await compressImageToDataUrl(file, 800, 0.75);
    } catch {
      return "";
    }
  }
};
