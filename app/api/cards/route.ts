import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const cardSchema = z.object({
  catalogCardId: z.string().trim().min(1),
  quantity: z.number().int().positive().default(1),
});

export async function GET() {
  const cards = await db.collectionEntry.findMany({
    include: {
      catalogCard: {
        include: {
          set: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = cardSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid request body",
        issues: parsed.error.flatten(),
      },
      {
        status: 400,
      }
    );
  }

  const card = await db.collectionEntry.upsert({
    where: {
      catalogCardId: parsed.data.catalogCardId,
    },
    create: {
      catalogCardId: parsed.data.catalogCardId,
      quantity: parsed.data.quantity,
      acquiredAt: new Date(),
    },
    update: {
      quantity: {
        increment: parsed.data.quantity,
      },
    },
  });

  return NextResponse.json(card, { status: 201 });
}
