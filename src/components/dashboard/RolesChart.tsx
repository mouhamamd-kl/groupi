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

import type { RoleStat } from "@/lib/analytics-queries";

import ChartTooltip from "./ChartTooltip";

export default function RolesChart({ data }: { data: RoleStat[] }) {
  const isEmpty = data.every((row) => !row.posts && !row.contacts);

  if (isEmpty) {
    return <div className="chart-empty">لا توجد بيانات في هذه الفترة بعد</div>;
  }

  const height = Math.max(220, data.length * 44 + 60);

  return (
    <div dir="ltr" className="chart-frame">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--line)"
            horizontal={false}
          />
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis
            type="category"
            dataKey="label"
            width={150}
            tick={{ fontSize: 12, fill: "var(--ink)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "rgba(17, 24, 39, 0.05)" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="posts" name="منشورات" fill="var(--blue)" radius={[0, 4, 4, 0]} barSize={14} />
          <Bar dataKey="contacts" name="تواصل" fill="var(--teal)" radius={[0, 4, 4, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}