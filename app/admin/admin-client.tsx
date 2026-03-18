'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getCardImageUrl } from "@/lib/imgproxy";
import { attachCardImage, attachSetImage, createCatalogCard, createSet, deleteCatalogCard, deleteSet } from "./actions";

type AdminSet = {
  id: string;
  name: string;
  imageKey: string | null;
  _count: { cards: number };
  createdAt: Date;
};

type AdminCard = {
  id: string;
  name: string;
  imageKey: string | null;
  setId: string;
  setName?: string;
};

export function AdminClient({
  sets,
  cards,
  adminKey,
}: {
  sets: AdminSet[];
  cards: any[];
  adminKey: string;
}) {
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [showAddSetModal, setShowAddSetModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState<{ type: 'set' | 'card'; id: string } | null>(null);

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
    }).format(new Date(date));

  const formatValue = (cardCount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cardCount * 50);

  // Transform cards to only include needed fields
  const formattedCards: AdminCard[] = cards.map((c) => ({
    id: c.id,
    name: c.name,
    imageKey: c.imageKey,
    setId: c.setId,
    setName: c.set?.name,
  }));

  // Show set list view
  if (!selectedSetId) {
    return (
      <main className="min-h-full bg-slate-950 px-4 py-8 text-slate-100 md:px-6 md:py-10">
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <header className="rounded-3xl border border-slate-800 bg-linear-to-r from-emerald-950 via-cyan-950 to-blue-950 p-6 shadow-2xl md:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Admin</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Catalog Admin</h1>
            <p className="mt-3 text-sm text-slate-300 md:text-base">Manage sets and cards in your collection.</p>
            <Link href="/" className="mt-4 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200">
              Back to collection
            </Link>
          </header>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div
              onClick={() => setShowAddSetModal(true)}
              className="group cursor-pointer rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-4 shadow-lg transition hover:border-emerald-400 hover:bg-slate-800"
            >
              <div className="flex h-full min-h-40 items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl leading-none text-slate-600 transition group-hover:text-emerald-400">+</div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400 transition group-hover:text-slate-300">
                    Add Set
                  </p>
                </div>
              </div>
            </div>

            {sets.map((set) => {
              const imageUrl = set.imageKey ? getCardImageUrl(set.imageKey, 360, 180) : null;
              const setCode = getSetCode(set.name);
              const releaseDate = formatShortDate(set.createdAt);
              const estimatedValue = formatValue(set._count.cards);

              return (
                <article
                  key={set.id}
                  onClick={() => setSelectedSetId(set.id)}
                  className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-lg transition hover:border-cyan-500/60"
                >
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
                        <span className="font-semibold text-slate-200">{set._count.cards} cards</span>
                        <span className="font-semibold text-slate-400">100%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: "100%" }} />
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-3 text-slate-500">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedSetId(set.id);
                      }}
                      className="text-sm transition hover:text-cyan-300"
                      aria-label="Open set analytics"
                    >
                      ║║║
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedSetId(set.id);
                      }}
                      className="text-sm transition hover:text-cyan-300"
                      aria-label="Open set actions"
                    >
                      ⋮
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        </section>

        {/* Add Set Modal */}
        {showAddSetModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-w-md w-full">
              <h2 className="text-xl font-semibold">Add New Set</h2>
              <form
                action={async (formData) => {
                  await createSet(formData);
                  setShowAddSetModal(false);
                }}
                className="mt-4 flex flex-col gap-4"
              >
                <input type="hidden" name="adminKey" value={adminKey} />
                <input
                  name="setName"
                  required
                  placeholder="Set name"
                  className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none ring-emerald-400 focus:ring"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSetModal(false)}
                    className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300"
                  >
                    Create Set
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    );
  }

  // Show set detail view (cards in set)
  const currentSet = sets.find((s) => s.id === selectedSetId);
  const cardsInSet = formattedCards.filter((c) => c.setId === selectedSetId);

  return (
    <main className="min-h-full bg-slate-950 px-4 py-8 text-slate-100 md:px-6 md:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-800 bg-linear-to-r from-emerald-950 via-cyan-950 to-blue-950 p-6 shadow-2xl md:p-8">
          <button
            onClick={() => setSelectedSetId(null)}
            className="text-xs font-medium text-emerald-300 hover:text-emerald-200 transition"
          >
            ← Back to Sets
          </button>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{currentSet?.name}</h1>
          <p className="mt-2 text-sm text-slate-300 md:text-base">Manage cards in this set.</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {/* Add Card */}
          <div
            onClick={() => setShowAddCardModal(true)}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 transition hover:border-emerald-400 hover:bg-slate-800"
          >
            <div className="flex aspect-3/4 w-full items-center justify-center bg-slate-900">
              <div className="text-center">
                <div className="text-6xl text-slate-600 transition group-hover:text-emerald-400">+</div>
                <p className="mt-2 text-sm font-medium text-slate-400 transition group-hover:text-slate-300">Add Card</p>
              </div>
            </div>
          </div>

          {/* Cards */}
          {cardsInSet.map((card) => {
            const imageUrl = card.imageKey ? getCardImageUrl(card.imageKey, 480, 680) : null;

            return (
              <div key={card.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-800">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={card.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-cyan-400 px-2.5 py-1 text-xs font-bold text-slate-950">
                    ADMIN
                  </span>
                </div>
                <div className="space-y-1 p-4">
                  <p className="line-clamp-1 text-sm font-semibold text-white">{card.name}</p>
                  <p className="line-clamp-1 text-xs text-slate-400">{card.setName ?? currentSet?.name}</p>
                  <p className="pt-1 text-xs text-slate-500">Catalog entry</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setShowImageUploadModal({ type: 'card', id: card.id })}
                      className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
                    >
                      Upload
                    </button>
                    <form action={deleteCatalogCard} className="ml-auto">
                      <input type="hidden" name="adminKey" value={adminKey} />
                      <input type="hidden" name="catalogCardId" value={card.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-rose-800 px-2.5 py-1 text-xs font-medium text-rose-300 transition hover:bg-rose-950/40"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Set Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowImageUploadModal({ type: 'set', id: selectedSetId })}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Upload Set Image
          </button>
          <form action={deleteSet} className="flex-1">
            <input type="hidden" name="adminKey" value={adminKey} />
            <input type="hidden" name="setId" value={selectedSetId} />
            <button
              type="submit"
              className="w-full rounded-lg border border-rose-800 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-950/40"
            >
              Delete Set
            </button>
          </form>
        </div>
      </section>

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-w-md w-full">
            <h2 className="text-xl font-semibold">Add Card to {currentSet?.name}</h2>
            <form
              action={async (formData) => {
                await createCatalogCard(formData);
                setShowAddCardModal(false);
              }}
              className="mt-4 flex flex-col gap-4"
            >
              <input type="hidden" name="adminKey" value={adminKey} />
              <input type="hidden" name="setId" value={selectedSetId} />
              <input
                name="cardName"
                required
                placeholder="Card name"
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none ring-emerald-400 focus:ring"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-w-md w-full">
            <h2 className="text-xl font-semibold">
              Upload {showImageUploadModal.type === 'set' ? 'Set' : 'Card'} Image
            </h2>
            <form
              action={async (formData) => {
                if (showImageUploadModal.type === 'set') {
                  await attachSetImage(formData);
                } else {
                  await attachCardImage(formData);
                }
                setShowImageUploadModal(null);
              }}
              className="mt-4 flex flex-col gap-4"
              encType="multipart/form-data"
            >
              <input type="hidden" name="adminKey" value={adminKey} />
              <input
                type="hidden"
                name={showImageUploadModal.type === 'set' ? 'setId' : 'catalogCardId'}
                value={showImageUploadModal.id}
              />
              <input
                name="file"
                type="file"
                accept="image/*"
                required
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowImageUploadModal(null)}
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
