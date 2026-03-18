import Link from "next/link";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { AdminClient } from "./admin-client";

export const dynamic = "force-dynamic";

function assertAdminAccess(keyValue: string | null) {
  if (!keyValue || keyValue !== env.ADMIN_ACCESS_KEY) {
    throw new Error("Unauthorized");
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const params = await searchParams;
  const key = params.key?.trim() ?? "";
  const isAuthorized = key.length > 0 && key === env.ADMIN_ACCESS_KEY;

  if (!isAuthorized) {
    return (
      <main className="min-h-full bg-slate-950 px-4 py-8 text-slate-100 md:px-6 md:py-12">
        <section className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <h1 className="text-2xl font-semibold">Catalog Admin</h1>
          <p className="mt-3 text-slate-300">
            This area is restricted. Open this page with your admin access key to manage sets, cards, and
            images.
          </p>
          <p className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-300">
            /admin?key=YOUR_ADMIN_ACCESS_KEY
          </p>
          <Link href="/" className="mt-6 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200">
            Back to collection
          </Link>
        </section>
      </main>
    );
  }

  const [sets, cards] = await Promise.all([
    db.cardSet.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            cards: true,
          },
        },
      },
    }),
    db.catalogCard.findMany({
      include: {
        set: true,
      },
      orderBy: [{ set: { name: "asc" } }, { name: "asc" }],
    }),
  ]);

  return <AdminClient sets={sets} cards={cards} adminKey={key} />;
}
