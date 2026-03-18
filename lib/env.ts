import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/tcg_collection_manager?schema=public"),
  MINIO_BUCKET: z.string().default("tcg-images"),
  MINIO_ENDPOINT: z.string().default("localhost"),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  MINIO_ACCESS_KEY: z.string().default("minioadmin"),
  MINIO_SECRET_KEY: z.string().default("minioadmin"),
  IMGPROXY_KEY: z.string().regex(/^[0-9a-fA-F]+$/).default("7365637265746b65797365637265746b65797365637265746b65797365637265"),
  IMGPROXY_SALT: z.string().regex(/^[0-9a-fA-F]+$/).default("73656372657473616c7473656372657473616c7473656372657473616c747365"),
  IMGPROXY_SOURCE_BASE_URL: z.string().url().default("http://minio:9000"),
  NEXT_PUBLIC_IMGPROXY_BASE_URL: z.string().url().default("http://localhost:8080"),
  ADMIN_ACCESS_KEY: z.string().default("change-me"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;
