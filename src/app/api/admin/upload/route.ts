import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "dwadcfj3b";
    const apiKey = process.env.CLOUDINARY_API_KEY || "358689843946899";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "thfMre9JBxMvcid6R0jZyA2uVVs";

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: "Cloudinary credentials missing." },
        { status: 500 }
      );
    }

    let fileToUpload: string | Blob = "";
    let folder = "pure_ayur_herbs";
    let cropPreset = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file) {
        return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
      }
      folder = (formData.get("folder") as string) || folder;
      cropPreset = (formData.get("cropPreset") as string) || "";

      if (typeof file === "string") {
        fileToUpload = file;
      } else if (file instanceof Blob) {
        // Convert Blob/File to buffer / base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mime = file.type || "image/jpeg";
        fileToUpload = `data:${mime};base64,${buffer.toString("base64")}`;
      }
    } else {
      const body = await request.json();
      fileToUpload = body.file || "";
      if (body.folder) folder = body.folder;
      if (body.cropPreset) cropPreset = body.cropPreset;
    }

    if (!fileToUpload) {
      return NextResponse.json({ success: false, error: "Invalid or empty image file" }, { status: 400 });
    }

    // Prepare signed upload request
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

    const uploadFormData = new FormData();
    uploadFormData.append("file", fileToUpload);
    uploadFormData.append("api_key", apiKey);
    uploadFormData.append("timestamp", timestamp.toString());
    uploadFormData.append("signature", signature);
    uploadFormData.append("folder", folder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadFormData,
    });

    const data = await uploadRes.json();

    if (!uploadRes.ok || !data.secure_url) {
      console.error("[Cloudinary Upload Error]:", data);
      return NextResponse.json(
        { success: false, error: data.error?.message || "Cloudinary upload failed" },
        { status: 500 }
      );
    }

    // Cloudinary AI Smart Crop (g_auto) & Responsive Format
    const rawSecureUrl = data.secure_url;
    let optimizedUrl = rawSecureUrl;
    let desktopUrl = "";
    let mobileUrl = "";

    const isSlideUpload = cropPreset === "hero_desktop" || folder.includes("slides");
    const isMobileSlideUpload = cropPreset === "hero_mobile";
    const isProductUpload = cropPreset === "product" || folder.includes("products");

    if (rawSecureUrl.includes("/image/upload/")) {
      if (isSlideUpload) {
        desktopUrl = rawSecureUrl.replace("/image/upload/", "/image/upload/c_pad,w_1920,h_600,b_auto,f_auto,q_auto/");
        mobileUrl = rawSecureUrl.replace("/image/upload/", "/image/upload/c_pad,w_1080,h_1080,b_auto,f_auto,q_auto/");
        optimizedUrl = desktopUrl;
      } else if (isMobileSlideUpload) {
        mobileUrl = rawSecureUrl.replace("/image/upload/", "/image/upload/c_pad,w_1080,h_1080,b_auto,f_auto,q_auto/");
        optimizedUrl = mobileUrl;
      } else if (isProductUpload) {
        optimizedUrl = rawSecureUrl.replace("/image/upload/", "/image/upload/c_pad,w_1000,h_1000,b_white,f_auto,q_auto/");
      } else {
        optimizedUrl = rawSecureUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
      }
    }

    return NextResponse.json({
      success: true,
      url: optimizedUrl,
      desktopUrl: desktopUrl || optimizedUrl,
      mobileUrl: mobileUrl || "",
      rawUrl: rawSecureUrl,
      publicId: data.public_id,
      bytes: data.bytes,
      format: data.format,
      width: data.width,
      height: data.height,
    });
  } catch (error: any) {
    console.error("[Cloudinary Route Exception]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
