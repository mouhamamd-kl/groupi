"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { HourStat, WeekdayStat } from "@/lib/analytics-queries";

import ChartTooltip from "./ChartTooltip";

interface HoursChartProps {
  hours: HourStat[];
  weekdays: WeekdayStat[];
}

export default function HoursChart({ hours, weekdays }: HoursChartProps) {
  const isEmpty = hours.every((point) => !point.count);

  if (isEmpty) {
    return <div className="chart-empty">لا توجد بيانات في هذه الفترة بعد</div>;
  }

  return (
    <div className="hours-chart">
      <div dir="ltr" className="chart-frame">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart
            data={hours}
            margin={{ top: 8, right: 0, left: -14, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--line)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--muted)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--line)" }}
              interval={3}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "var(--muted)" }}
              tickLine={false}
              axisLine={false}
              width={34}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(17, 24, 39, 0.05)" }}
            />
            <Bar dataKey="count" name="أحداث" fill="var(--blue)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div dir="ltr" className="chart-frame">
        <ResponsiveContainer width="100%" height={170}>
          <BarChart
            data={weekdays}
            margin={{ top: 8, right: 0, left: -14, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--line)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--muted)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--line)" }}
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "var(--muted)" }}
              tickLine={false}
              axisLine={false}
              width={34}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(17, 24, 39, 0.05)" }}
            />
            <Bar dataKey="count" name="أحداث" fill="var(--purple)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}