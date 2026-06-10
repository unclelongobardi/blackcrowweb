import { NextResponse } from "next/server";
import sharp from "sharp";
import { getAuthedProfile } from "@/lib/auth";
import { enforceUploadRateLimit } from "@/lib/financialRateLimit";
import { queryOne } from "@/lib/db";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await enforceUploadRateLimit(request, ctx.profile.id);
  if (limited) return limited;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No image file provided." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 2 MB." }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED.has(mime)) {
    return NextResponse.json({ error: "Use JPG, PNG, WebP, or GIF." }, { status: 400 });
  }

  const input = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  try {
    output = await sharp(input)
      .rotate()
      .resize(256, 256, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "Could not process image." }, { status: 400 });
  }

  if (output.length > 350_000) {
    output = await sharp(output).webp({ quality: 65 }).toBuffer();
  }

  const avatarUrl = `data:image/webp;base64,${output.toString("base64")}`;

  const profile = await queryOne<Profile>(
    `update profiles
       set avatar_url = $1, avatar_seed = 'custom'
     where id = $2
     returning *`,
    [avatarUrl, ctx.profile.id],
  );

  return NextResponse.json({ profile, avatar_url: avatarUrl });
}

export async function DELETE(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await queryOne<Profile>(
    `update profiles
       set avatar_url = null,
           avatar_seed = case when avatar_seed = 'custom' then 'av1' else avatar_seed end
     where id = $1
     returning *`,
    [ctx.profile.id],
  );

  return NextResponse.json({ profile });
}
