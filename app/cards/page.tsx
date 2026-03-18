import { revalidatePath } from "next/cache";
import Image from "next/image";
import { db } from "@/lib/db";
import { getCardImageUrl } from "@/lib/imgproxy";

export const dynamic = "force-dynamic";

async function addToCollection(formData: FormData) {
  "use server";

  const catalogCardId = formData.get("catalogCardId")?.toString().trim();
  const quantityValue = Number.parseInt(formData.get("quantity")?.toString() ?? "1", 10);
  const quantity = Number.isNaN(quantityValue) ? 1 : Math.max(1, quantityValue);

  if (!catalogCardId) {
    return;
  }

  await db.collectionEntry.upsert({
    where: { catalogCardId },
    create: {
      quantity,
      acquiredAt: new Date(),
      catalogCard: {
        connect: {
          id: catalogCardId,
        },
      },
    },
    update: {
      quantity: {
        increment: quantity,
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/cards");
  revalidatePath("/sets");
  revalidatePath("/lists");
}

async function decrementFromCollection(formData: FormData) {
  "use server";

  const catalogCardId = formData.get("catalogCardId")?.toString().trim();

  if (!catalogCardId) {
    return;
  }

  const existing = await db.collectionEntry.findUnique({
    where: { catalogCardId },
    select: { quantity: true },
  });

  if (!existing) {
    return;
  }

  if (existing.quantity <= 1) {
    await db.collectionEntry.delete({
      where: { catalogCardId },
    });
  } else {
    await db.collectionEntry.update({
      where: { catalogCardId },
      data: {
        quantity: {
          decrement: 1,
        },
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/cards");
  revalidatePath("/sets");
  revalidatePath("/lists");
}

async function removeFromCollection(formData: FormData) {
  "use server";

  const catalogCardId = formData.get("catalogCardId")?.toString().trim();

  if (!catalogCardId) {
    return;
  }

  await db.collectionEntry.deleteMany({
    where: { catalogCardId },
  });

  revalidatePath("/");
  revalidatePath("/cards");
  revalidatePath("/sets");
  revalidatePath("/lists");
}

export default async function CardsPage() {
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

  const totalOwned = collectionEntries.reduce((sum, entry) => sum + entry.quantity, 0);

  return (
    <main className="min-h-full bg-slate-950 px-4 py-8 text-slate-100 md:px-6 md:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-800 bg-linear-to-r from-blue-950 via-slate-900 to-cyan-950 p-6 shadow-2xl md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Cards</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Collection Cards</h1>
          <p className="mt-3 text-sm text-slate-300 md:text-base">{totalOwned} cards owned across {collectionEntries.length} unique entries.</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Quick Add</h2>
            <p className="mt-1 text-sm text-slate-400">Add cards from approved catalog entries.</p>
            <form action={addToCollection} className="mt-4 space-y-3">
              <label className="flex flex-col gap-2 text-sm">
                Card
                <select
                  name="catalogCardId"
                  required
                  defaultValue=""
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm outline-none ring-emerald-400 focus:ring"
                >
                  <option value="" disabled>
                    Select a catalog card
                  </option>
                  {catalogCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.set.name} - {card.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Quantity
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  defaultValue={1}
                  required
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm outline-none ring-emerald-400 focus:ring"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Add To Collection
              </button>
            </form>
          </aside>

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 md:p-6">
            {collectionEntries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-slate-400">
                Your collection is empty. Add cards from the Quick Add panel.
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {collectionEntries.map((entry) => {
                  const imageKey = entry.catalogCard.imageKey ?? entry.catalogCard.set.imageKey;
                  const imageUrl = imageKey ? getCardImageUrl(imageKey, 480, 680) : null;

                  return (
                    <li key={entry.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                      <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-800">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={entry.catalogCard.name}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 300px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
                        )}
                        <span className="absolute right-3 top-3 rounded-full bg-emerald-400 px-2.5 py-1 text-xs font-bold text-slate-950">
                          x{entry.quantity}
                        </span>
                      </div>
                      <div className="space-y-1 p-4">
                        <p className="line-clamp-1 text-sm font-semibold text-white">{entry.catalogCard.name}</p>
                        <p className="line-clamp-1 text-xs text-slate-400">{entry.catalogCard.set.name}</p>
                        <p className="pt-1 text-xs text-slate-500">
                          Updated {new Date(entry.updatedAt).toLocaleDateString()}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <form action={decrementFromCollection}>
                            <input type="hidden" name="catalogCardId" value={entry.catalogCardId} />
                            <button
                              type="submit"
                              className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
                            >
                              -1
                            </button>
                          </form>
                          <form action={addToCollection}>
                            <input type="hidden" name="catalogCardId" value={entry.catalogCardId} />
                            <input type="hidden" name="quantity" value="1" />
                            <button
                              type="submit"
                              className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
                            >
                              +1
                            </button>
                          </form>
                          <form action={removeFromCollection} className="ml-auto">
                            <input type="hidden" name="catalogCardId" value={entry.catalogCardId} />
                            <button
                              type="submit"
                              className="rounded-lg border border-rose-800 px-2.5 py-1 text-xs font-medium text-rose-300 transition hover:bg-rose-950/40"
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}
