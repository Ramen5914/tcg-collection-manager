import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

const client = new S3Client({
  endpoint: `${env.MINIO_USE_SSL ? "https" : "http"}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`,
  forcePathStyle: true,
  region: "us-east-1",
  credentials: {
    accessKeyId: env.MINIO_ACCESS_KEY,
    secretAccessKey: env.MINIO_SECRET_KEY,
  },
});

export async function uploadCardImage(params: {
  objectKey: string;
  body: Buffer;
  contentType: string;
}) {
  const command = new PutObjectCommand({
    Bucket: env.MINIO_BUCKET,
    Key: params.objectKey,
    Body: params.body,
    ContentType: params.contentType,
  });

  await client.send(command);
}
