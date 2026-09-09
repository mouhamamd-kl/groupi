"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ActivityPoint } from "@/lib/analytics-queries";

import ChartTooltip from "./ChartTooltip";

export default function ActivityChart({ data }: { data: ActivityPoint[] }) {
  const isEmpty = data.every((point) => !point.views && !point.posts && !point.contacts);

  if (isEmpty) {
    return <div className="chart-empty">لا توجد بيانات في هذه الفترة بعد</div>;
  }

  return (
    <div dir="ltr" className="chart-frame">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--line)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--line)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "rgba(17, 24, 39, 0.05)" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="views" name="زيارات" fill="var(--blue)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="posts" name="منشورات" fill="var(--purple)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="contacts" name="تواصل" fill="var(--teal)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}