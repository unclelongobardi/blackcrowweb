import { NextResponse } from "next/server";
import sharp from "sharp";
import { getAuthedProfile } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_VIDEO_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export async function POST(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";

  if (IMAGE_TYPES.has(mime)) {
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image must be under 4 MB." }, { status: 400 });
    }
    const input = Buffer.from(await file.arrayBuffer());
    let output: Buffer;
    try {
      output = await sharp(input)
        .rotate()
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } catch {
      return NextResponse.json({ error: "Could not process image." }, { status: 400 });
    }
    if (output.length > 900_000) {
      output = await sharp(output).webp({ quality: 60 }).toBuffer();
    }
    return NextResponse.json({
      type: "image" as const,
      url: `data:image/webp;base64,${output.toString("base64")}`,
    });
  }

  if (VIDEO_TYPES.has(mime)) {
    if (file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: "Video must be under 8 MB." }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    return NextResponse.json({
      type: "video" as const,
      url: `data:${mime};base64,${buf.toString("base64")}`,
    });
  }

  return NextResponse.json({ error: "Use JPG/PNG/WebP/GIF or MP4/WebM video." }, { status: 400 });
}
