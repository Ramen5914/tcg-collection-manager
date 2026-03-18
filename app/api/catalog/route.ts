import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const sets = await db.cardSet.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      cards: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  return NextResponse.json(sets);
}
