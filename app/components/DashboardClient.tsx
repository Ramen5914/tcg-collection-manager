"use client";

import { useState } from "react";
import {
  DashboardMetricCard,
  type DashboardMetricSnapshot,
  type DashboardPeriodKey,
} from "@/app/components/DashboardMetricCard";

type DashboardMetricCardData = {
  label: string;
  format: "number" | "currency";
  toneClassName: string;
  lineColor: string;
  periods: Record<DashboardPeriodKey, DashboardMetricSnapshot>;
};

type DashboardClientProps = {
  metricCards: DashboardMetricCardData[];
};

const periodOrder: DashboardPeriodKey[] = ["7D", "30D", "90D", "1Y"];

export function DashboardClient({ metricCards }: DashboardClientProps) {
  const [activePeriod, setActivePeriod] = useState<DashboardPeriodKey>("30D");

  return (
    <>
      <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/75 p-1.5">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Time Period</p>
        <div className="flex gap-1 rounded-lg border border-slate-700 bg-slate-900 p-1">
          {periodOrder.map((period) => {
            const isActive = period === activePeriod;

            return (
              <button
                key={period}
                type="button"
                onClick={() => setActivePeriod(period)}
                className={`rounded px-2 py-1 text-[10px] font-semibold tracking-wide transition sm:text-xs ${
                  isActive
                    ? "bg-emerald-400 text-slate-900"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                {period}
              </button>
            );
          })}
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <DashboardMetricCard
            key={metric.label}
            label={metric.label}
            toneClassName={metric.toneClassName}
            lineColor={metric.lineColor}
            format={metric.format}
            periods={metric.periods}
            activePeriod={activePeriod}
          />
        ))}
      </section>
    </>
  );
}
