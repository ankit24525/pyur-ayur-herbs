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

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file) {
        return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
      }
      folder = (formData.get("folder") as string) || folder;

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

    // Insert f_auto,q_auto into the delivery URL for maximum automatic compression and responsive format
    let optimizedUrl = data.secure_url;
    if (optimizedUrl.includes("/image/upload/")) {
      optimizedUrl = optimizedUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
    }

    return NextResponse.json({
      success: true,
      url: optimizedUrl,
      rawUrl: data.secure_url,
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
