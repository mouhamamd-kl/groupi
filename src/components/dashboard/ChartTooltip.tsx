"use client";

interface TooltipItem {
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  name?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipItem[];
}

export default function ChartTooltip({
  active,
  label,
  payload,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div dir="rtl" className="chart-tooltip">
      {label != null && <div className="chart-tooltip-label">{label}</div>}

      {payload.map((item, index) => (
        <div key={index} className="chart-tooltip-item">
          <span
            className="chart-tooltip-dot"
            style={{ background: item.color }}
          />
          <span>{item.name}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}