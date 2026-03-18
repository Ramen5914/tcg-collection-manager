import crypto from "crypto";
import { env } from "@/lib/env";

function toBase64Url(input: Buffer | string) {
  const value = Buffer.isBuffer(input) ? input.toString("base64") : Buffer.from(input).toString("base64");

  return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function signPath(path: string) {
  const key = Buffer.from(env.IMGPROXY_KEY, "hex");
  const salt = Buffer.from(env.IMGPROXY_SALT, "hex");
  const hmac = crypto.createHmac("sha256", key);

  hmac.update(Buffer.concat([salt, Buffer.from(path)]));

  return toBase64Url(hmac.digest());
}

export function getCardImageUrl(imageKey: string, width = 640, height = 640) {
  const sourceUrl = `${env.IMGPROXY_SOURCE_BASE_URL}/${env.MINIO_BUCKET}/${imageKey}`;
  const encodedSource = toBase64Url(sourceUrl);
  const processing = `rs:fit:${width}:${height}:0`;
  const path = `/${processing}/${encodedSource}.webp`;
  const signature = signPath(path);

  return `${env.NEXT_PUBLIC_IMGPROXY_BASE_URL}/${signature}${path}`;
}
