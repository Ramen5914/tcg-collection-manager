import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getCardImageUrl } from "@/lib/imgproxy";
import { uploadCardImage } from "@/lib/storage";

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
}

export async function POST(request: Request) {
  const adminKey = request.headers.get("x-admin-key")?.trim();

  if (!adminKey || adminKey !== env.ADMIN_ACCESS_KEY) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        message: "Missing file field",
      },
      {
        status: 400,
      }
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const baseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, "") || "upload");
  const objectKey = `cards/${randomUUID()}-${baseName}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  await uploadCardImage({
    objectKey,
    body: Buffer.from(arrayBuffer),
    contentType: file.type || "application/octet-stream",
  });

  return NextResponse.json({
    objectKey,
    proxyUrl: getCardImageUrl(objectKey),
  });
}
