import Image from "next/image";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCardImageUrl } from "@/lib/imgproxy";

export const dynamic = "force-dynamic";

async function addSetToCollection(formData: FormData) {
  "use server";

  const setId = formData.get("setId")?.toString().trim();

  if (!setId) {
    return;
  }

  const cardsInSet = await db.catalogCard.findMany({
    where: { setId },
    select: { id: true },
  });

  if (cardsInSet.length === 0) {
    return;
  }

  await db.$transaction(
    cardsInSet.map((card) =>
      db.collectionEntry.upsert({
        where: {
          catalogCardId: card.id,
        },
        create: {
          catalogCardId: card.id,
          quantity: 1,
          acquiredAt: new Date(),
        },
        update: {
          quantity: {
            increment: 1,
          },
        },
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/cards");
  revalidatePath("/sets");
  revalidatePath("/lists");
}

async function removeSetFromCollection(formData: FormData) {
  "use server";

  const setId = formData.get("setId")?.toString().trim();

  if (!setId) {
    return;
  }

  await db.collectionEntry.deleteMany({
    where: {
      catalogCard: {
        setId,
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/cards");
  revalidatePath("/sets");
  revalidatePath("/lists");
}

export default async function SetsPage() {
  const sets = await db.cardSet.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      cards: {
        include: {
          collectionEntries: {
            select: {
              quantity: true,
            },
          },
        },
      },
    },
  });

  const getSetCode = (name: string) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .padEnd(3, "X")
      .slice(0, 3);

  const formatShortDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

  const formatValue = (totalOwned: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(totalOwned * 50);

  const summaries = sets.map((set) => {
    const totalCards = set.cards.length;
    const ownedUnique = set.cards.filter((card) => card.collectionEntries.length > 0).length;
    const totalOwned = set.cards.reduce(
      (sum, card) => sum + card.collectionEntries.reduce((cardSum, entry) => cardSum + entry.quantity, 0),
      0
    );
    const completionPercent = totalCards > 0 ? Math.round((ownedUnique / totalCards) * 100) : 0;

    return {
      id: set.id,
      name: set.name,
      imageKey: set.imageKey,
      createdAt: set.createdAt,
      totalCards,
      ownedUnique,
      totalOwned,
      completionPercent,
    };
  });

  return (
    <main className="min-h-full bg-slate-950 px-4 py-8 text-slate-100 md:px-6 md:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-800 bg-linear-to-r from-cyan-950 via-slate-900 to-blue-950 p-6 shadow-2xl md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Sets</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Set Progress</h1>
          <p className="mt-3 text-sm text-slate-300 md:text-base">Live completion and ownership across your catalog sets.</p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaries.map((set) => {
            const imageUrl = set.imageKey ? getCardImageUrl(set.imageKey, 360, 180) : null;
            const setCode = getSetCode(set.name);
            const releaseDate = formatShortDate(set.createdAt);
            const estimatedValue = formatValue(set.totalOwned);

            return (
              <article key={set.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-lg transition hover:border-cyan-500/60">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-200">
                    {setCode}
                  </span>
                  <p className="truncate text-lg font-semibold leading-none text-cyan-300">{set.name}</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-28 shrink-0 overflow-hidden rounded-md bg-slate-800">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={set.name} fill unoptimized className="object-contain" sizes="112px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-slate-400">No image</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="text-slate-400">{releaseDate}</span>
                      <span className="font-semibold text-cyan-300">{estimatedValue}</span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-200">
                        {set.ownedUnique}/{set.totalCards}
                      </span>
                      <span className="font-semibold text-slate-400">{set.completionPercent}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: `${set.completionPercent}%` }} />
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-3 text-slate-500">
                    <span className="text-sm">║║║</span>
                    <span className="text-sm">⋮</span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <form action={addSetToCollection} className="flex-1">
                      <input type="hidden" name="setId" value={set.id} />
                      <button
                        type="submit"
                        className="w-full rounded-lg border border-slate-700 px-2 py-1.5 text-xs font-medium text-slate-100 transition hover:bg-slate-800"
                      >
                        Add Set
                      </button>
                    </form>
                    <form action={removeSetFromCollection} className="flex-1">
                      <input type="hidden" name="setId" value={set.id} />
                      <button
                        type="submit"
                        className="w-full rounded-lg border border-rose-800 px-2 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-950/40"
                      >
                        Remove Set
                      </button>
                    </form>
                  </div>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
