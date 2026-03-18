"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

type MetricSparklineProps = {
  points: number[];
  color: string;
};

export function MetricSparkline({ points, color }: MetricSparklineProps) {
  const data = points.map((value, index) => ({
    index,
    value,
  }));

  return (
    <div className="h-20 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 0, left: 0, bottom: 0 }} accessibilityLayer={false}>
          <Tooltip
            cursor={{ stroke: "#334155", strokeWidth: 1 }}
            labelFormatter={(label) => `Point ${Number(label) + 1}`}
            formatter={(value) => {
              if (value == null) {
                return ["-", "Value"];
              }

              const parsedValue = typeof value === "number" ? value : Number(value);

              if (Number.isNaN(parsedValue)) {
                return [String(value), "Value"];
              }

              return [new Intl.NumberFormat("en-US").format(parsedValue), "Value"];
            }}
            contentStyle={{
              backgroundColor: "#020617",
              border: "1px solid #1e293b",
              borderRadius: "0.5rem",
              color: "#e2e8f0",
              fontSize: "12px",
              padding: "6px 8px",
            }}
            itemStyle={{ color: "#e2e8f0" }}
            labelStyle={{ color: "#94a3b8" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 3 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
