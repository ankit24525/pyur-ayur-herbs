"use client";

// High-efficiency WebP exporter: compresses user review images to lightweight WebP
export const compressImageToDataUrl = (file: File, maxDim = 1200, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
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
      img.onerror = () => {
        // If image object fails to decode (e.g. unusual format), resolve with reader data URL
        resolve((e.target?.result as string) || "");
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

// Upload review photo to Cloudinary CDN via /api/admin/upload with automatic fallback
export const uploadReviewImage = async (file: File): Promise<string> => {
  // Pre-generate a compressed local data URL so we always have an instant, reliable fallback
  let localCompressed = "";
  try {
    localCompressed = await compressImageToDataUrl(file, 1000, 0.82);
  } catch (err) {
    console.warn("Client-side image compression error:", err);
  }

  try {
    // 1. Upload to /api/admin/upload using compressed data URL (super fast, < 200KB)
    const formData = new FormData();
    if (localCompressed) {
      formData.append("file", localCompressed);
    } else {
      formData.append("file", file);
    }
    formData.append("folder", "pure_ayur_reviews");

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.url) return data.url;
    }

    // 2. Fallback to pre-compressed data URL if CDN upload did not return a 200 OK
    if (localCompressed) return localCompressed;
  } catch (err) {
    console.warn("CDN review upload failed, using local compressed image:", err);
    if (localCompressed) return localCompressed;
  }

  // 3. Guaranteed fallback: return compressed or empty string
  if (localCompressed) return localCompressed;
  try {
    return await compressImageToDataUrl(file, 600, 0.75);
  } catch {
    return "";
  }
};
