import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ListsPage() {
  const [catalogCards, collectionEntries] = await Promise.all([
    db.catalogCard.findMany({
      include: {
        set: true,
      },
      orderBy: [{ set: { name: "asc" } }, { name: "asc" }],
    }),
    db.collectionEntry.findMany({
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
    }),
  ]);

  const topQuantity = [...collectionEntries].sort((a, b) => b.quantity - a.quantity).slice(0, 12);
  const recentlyUpdated = collectionEntries.slice(0, 12);

  const ownedCardIds = new Set(collectionEntries.map((entry) => entry.catalogCardId));
  const missingCards = catalogCards.filter((card) => !ownedCardIds.has(card.id)).slice(0, 12);

  return (
    <main className="min-h-full bg-slate-950 px-4 py-8 text-slate-100 md:px-6 md:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-800 bg-linear-to-r from-violet-950 via-slate-900 to-cyan-950 p-6 shadow-2xl md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Lists</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Collection Lists</h1>
          <p className="mt-3 text-sm text-slate-300 md:text-base">Live list views generated from your current catalog and collection data.</p>
        </header>

        <section className="grid gap-6 xl:grid-cols-3">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-emerald-300">Top Quantity</h2>
            <ul className="mt-4 space-y-2">
              {topQuantity.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm">
                  <p className="font-medium">{entry.catalogCard.name}</p>
                  <p className="text-xs text-slate-400">{entry.catalogCard.set.name}</p>
                  <p className="mt-1 text-xs text-emerald-300">Owned: {entry.quantity}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-cyan-300">Recently Updated</h2>
            <ul className="mt-4 space-y-2">
              {recentlyUpdated.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm">
                  <p className="font-medium">{entry.catalogCard.name}</p>
                  <p className="text-xs text-slate-400">{entry.catalogCard.set.name}</p>
                  <p className="mt-1 text-xs text-cyan-300">{new Date(entry.updatedAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-violet-300">Missing From Collection</h2>
            <ul className="mt-4 space-y-2">
              {missingCards.map((card) => (
                <li key={card.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm">
                  <p className="font-medium">{card.name}</p>
                  <p className="text-xs text-slate-400">{card.set.name}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </section>
    </main>
  );
}
