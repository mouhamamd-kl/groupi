"use client";

import type { Funnel } from "@/lib/analytics-queries";

interface FunnelStep {
  index: string;
  value: number;
  label: string;
  rate?: string;
}

function pct(part: number, whole: number): string {
  if (whole <= 0) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

export default function FunnelSteps({ funnel }: { funnel: Funnel }) {
  const steps: FunnelStep[] = [
    { index: "١", value: funnel.published, label: "إعلان منشور" },
    {
      index: "٢",
      value: funnel.contacted,
      label: "إعلان حصل على تواصل",
      rate: `${pct(funnel.contacted, funnel.published)} من الخطوة السابقة`,
    },
    {
      index: "٣",
      value: funnel.contactEvents,
      label: "إجمالي محاولات التواصل",
      rate: `${pct(funnel.contactEvents, funnel.contacted)} من الخطوة السابقة`,
    },
  ];

  return (
    <div className="funnel">
      {steps.map((step) => (
        <div key={step.index} className="funnel-step">
          <span className="funnel-idx">الخطوة {step.index}</span>
          <b>{step.value}</b>
          <span>{step.label}</span>
          {step.rate && <div className="funnel-rate">{step.rate}</div>}
        </div>
      ))}
    </div>
  );
}