"use client";

import { MetricSparkline } from "@/app/components/MetricSparkline";

type PeriodKey = "7D" | "30D" | "90D" | "1Y";
export type DashboardPeriodKey = PeriodKey;

type MetricSnapshot = {
  value: number;
  points: number[];
};
export type DashboardMetricSnapshot = MetricSnapshot;

type DashboardMetricCardProps = {
  label: string;
  toneClassName: string;
  lineColor: string;
  format: "number" | "currency";
  periods: Record<PeriodKey, MetricSnapshot>;
  activePeriod: PeriodKey;
};

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function DashboardMetricCard({
  label,
  toneClassName,
  lineColor,
  format,
  periods,
  activePeriod,
}: DashboardMetricCardProps) {
  const currentSnapshot = periods[activePeriod];

  const value = format === "currency" ? currencyFormatter.format(currentSnapshot.value) : numberFormatter.format(currentSnapshot.value);

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className={`mt-2 text-3xl font-bold ${toneClassName}`}>{value}</p>
      </div>
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 px-2 py-1">
        <MetricSparkline points={currentSnapshot.points} color={lineColor} />
      </div>
    </article>
  );
}
