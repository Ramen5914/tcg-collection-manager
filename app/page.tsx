import { DashboardClient } from "@/app/components/DashboardClient";
import type { DashboardMetricSnapshot, DashboardPeriodKey } from "@/app/components/DashboardMetricCard";
import { db } from "@/lib/db";

type MetricCard = {
  label: string;
  format: "number" | "currency";
  toneClassName: string;
  lineColor: string;
  periods: Record<DashboardPeriodKey, DashboardMetricSnapshot>;
};

const periodDays: Record<DashboardPeriodKey, number> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
  "1Y": 365,
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function buildTimeline(days: number, buckets = 8) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days + 1);

  if (buckets <= 1) {
    return [now];
  }

  const startMs = start.getTime();
  const endMs = now.getTime();
  const step = (endMs - startMs) / (buckets - 1);

  return Array.from({ length: buckets }, (_, index) => new Date(startMs + step * index));
}

function buildMetricSeries(days: number, resolver: (moment: Date) => number) {
  const timeline = buildTimeline(days);
  const points = timeline.map((moment) => resolver(moment));

  return {
    value: points.at(-1) ?? 0,
    points,
  } satisfies DashboardMetricSnapshot;
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const [catalogCards, collectionEntries] = await Promise.all([
    db.catalogCard.findMany({
      select: {
        id: true,
        createdAt: true,
      },
    }),
    db.collectionEntry.findMany({
      select: {
        id: true,
        quantity: true,
        acquiredAt: true,
        createdAt: true,
      },
    }),
  ]);

  const catalogCardDates = catalogCards.map((card) => startOfDay(card.createdAt));
  const collectionEvents = collectionEntries.map((entry) => ({
    quantity: entry.quantity,
    date: startOfDay(entry.acquiredAt ?? entry.createdAt),
  }));

  const currentTotalCards = collectionEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const currentMarketValue = currentTotalCards;

  const metricCards: MetricCard[] = [
    {
      label: "Unique Card Count",
      format: "number",
      toneClassName: "text-emerald-300",
      lineColor: "#34d399",
      periods: {
        "7D": buildMetricSeries(periodDays["7D"], (moment) => collectionEvents.filter((event) => event.date <= moment).length),
        "30D": buildMetricSeries(periodDays["30D"], (moment) => collectionEvents.filter((event) => event.date <= moment).length),
        "90D": buildMetricSeries(periodDays["90D"], (moment) => collectionEvents.filter((event) => event.date <= moment).length),
        "1Y": buildMetricSeries(periodDays["1Y"], (moment) => collectionEvents.filter((event) => event.date <= moment).length),
      },
    },
    {
      label: "Unique Variant Count",
      format: "number",
      toneClassName: "text-cyan-300",
      lineColor: "#67e8f9",
      periods: {
        "7D": buildMetricSeries(periodDays["7D"], (moment) => catalogCardDates.filter((createdAt) => createdAt <= moment).length),
        "30D": buildMetricSeries(periodDays["30D"], (moment) => catalogCardDates.filter((createdAt) => createdAt <= moment).length),
        "90D": buildMetricSeries(periodDays["90D"], (moment) => catalogCardDates.filter((createdAt) => createdAt <= moment).length),
        "1Y": buildMetricSeries(periodDays["1Y"], (moment) => catalogCardDates.filter((createdAt) => createdAt <= moment).length),
      },
    },
    {
      label: "Total Cards",
      format: "number",
      toneClassName: "text-blue-300",
      lineColor: "#93c5fd",
      periods: {
        "7D": buildMetricSeries(periodDays["7D"], (moment) =>
          collectionEvents.filter((event) => event.date <= moment).reduce((sum, event) => sum + event.quantity, 0)
        ),
        "30D": buildMetricSeries(periodDays["30D"], (moment) =>
          collectionEvents.filter((event) => event.date <= moment).reduce((sum, event) => sum + event.quantity, 0)
        ),
        "90D": buildMetricSeries(periodDays["90D"], (moment) =>
          collectionEvents.filter((event) => event.date <= moment).reduce((sum, event) => sum + event.quantity, 0)
        ),
        "1Y": buildMetricSeries(periodDays["1Y"], (moment) =>
          collectionEvents.filter((event) => event.date <= moment).reduce((sum, event) => sum + event.quantity, 0)
        ),
      },
    },
    {
      label: "Market Value",
      format: "currency",
      toneClassName: "text-violet-300",
      lineColor: "#c4b5fd",
      periods: {
        "7D": buildMetricSeries(periodDays["7D"], (moment) =>
          collectionEvents.filter((event) => event.date <= moment).reduce((sum, event) => sum + event.quantity, 0)
        ),
        "30D": buildMetricSeries(periodDays["30D"], (moment) =>
          collectionEvents.filter((event) => event.date <= moment).reduce((sum, event) => sum + event.quantity, 0)
        ),
        "90D": buildMetricSeries(periodDays["90D"], (moment) =>
          collectionEvents.filter((event) => event.date <= moment).reduce((sum, event) => sum + event.quantity, 0)
        ),
        "1Y": buildMetricSeries(periodDays["1Y"], (moment) =>
          collectionEvents.filter((event) => event.date <= moment).reduce((sum, event) => sum + event.quantity, 0)
        ),
      },
    },
  ];

  metricCards[3].periods["7D"].value = currentMarketValue;
  metricCards[3].periods["30D"].value = currentMarketValue;
  metricCards[3].periods["90D"].value = currentMarketValue;
  metricCards[3].periods["1Y"].value = currentMarketValue;

  return (
    <main className="min-h-full bg-slate-950 px-4 py-8 text-slate-100 md:px-6 md:py-12">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-800 bg-linear-to-r from-emerald-950 via-cyan-950 to-blue-950 p-6 shadow-2xl md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Collection At A Glance</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
            Metrics are now generated from your live collection and catalog records.
          </p>
        </header>
        <DashboardClient metricCards={metricCards} />
      </section>
    </main>
  );
}
