'use server';

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { uploadCardImage } from "@/lib/storage";

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
}

function assertAdminAccess(keyValue: string | null) {
  if (!keyValue || keyValue !== env.ADMIN_ACCESS_KEY) {
    throw new Error("Unauthorized");
  }
}

export async function createSet(formData: FormData) {
  assertAdminAccess(formData.get("adminKey")?.toString() ?? null);
  const setName = formData.get("setName")?.toString().trim();

  if (!setName) {
    return;
  }

  await db.cardSet.upsert({
    where: { name: setName },
    create: { name: setName },
    update: {},
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/cards");
  revalidatePath("/sets");
  revalidatePath("/lists");
}

export async function createCatalogCard(formData: FormData) {
  assertAdminAccess(formData.get("adminKey")?.toString() ?? null);
  const setId = formData.get("setId")?.toString().trim();
  const cardName = formData.get("cardName")?.toString().trim();

  if (!setId || !cardName) {
    return;
  }

  await db.catalogCard.upsert({
    where: {
      setId_name: {
        setId,
        name: cardName,
      },
    },
    create: {
      name: cardName,
      setId,
    },
    update: {},
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/cards");
  revalidatePath("/sets");
  revalidatePath("/lists");
}

export async function deleteSet(formData: FormData) {
  assertAdminAccess(formData.get("adminKey")?.toString() ?? null);
  const setId = formData.get("setId")?.toString().trim();

  if (!setId) {
    return;
  }

  await db.cardSet.deleteMany({
    where: {
      id: setId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/cards");
  revalidatePath("/sets");
  revalidatePath("/lists");
}

export async function deleteCatalogCard(formData: FormData) {
  assertAdminAccess(formData.get("adminKey")?.toString() ?? null);
  const catalogCardId = formData.get("catalogCardId")?.toString().trim();

  if (!catalogCardId) {
    return;
  }

  await db.catalogCard.deleteMany({
    where: {
      id: catalogCardId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/cards");
  revalidatePath("/sets");
  revalidatePath("/lists");
}

export async function attachCardImage(formData: FormData) {
  assertAdminAccess(formData.get("adminKey")?.toString() ?? null);

  const catalogCardId = formData.get("catalogCardId")?.toString().trim();
  const file = formData.get("file");

  if (!catalogCardId || !(file instanceof File)) {
    return;
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

  await db.catalogCard.update({
    where: { id: catalogCardId },
    data: { imageKey: objectKey },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/cards");
  revalidatePath("/sets");
  revalidatePath("/lists");
}

export async function attachSetImage(formData: FormData) {
  assertAdminAccess(formData.get("adminKey")?.toString() ?? null);

  const setId = formData.get("setId")?.toString().trim();
  const file = formData.get("file");

  if (!setId || !(file instanceof File)) {
    return;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const baseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, "") || "upload");
  const objectKey = `sets/${randomUUID()}-${baseName}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  await uploadCardImage({
    objectKey,
    body: Buffer.from(arrayBuffer),
    contentType: file.type || "application/octet-stream",
  });

  await db.cardSet.update({
    where: { id: setId },
    data: { imageKey: objectKey },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/cards");
  revalidatePath("/sets");
  revalidatePath("/lists");
}
