import type { Role, Year } from "./types";

export const roleSeeds: Role[] = [
  { value: "general", label: "بدون تخصص محدد" },
  { value: "backend", label: "مطوّر Backend" },
  { value: "frontend", label: "مطوّر Frontend" },
  { value: "uiux", label: "مصمم UI/UX" },
  { value: "qatester", label: "مختبر QA" },
  { value: "mobile", label: "مطوّر Mobile" },
  { value: "database", label: "مهندس Database" },
  { value: "ai", label: "متخصص AI / Data" },
  { value: "devops", label: "مهندس DevOps" },
  { value: "security", label: "متخصص Security" },
];

export const yearSeeds: Year[] = [
  { value: 1, label: "السنة الأولى" },
  { value: 2, label: "السنة الثانية" },
  { value: 3, label: "السنة الثالثة" },
  { value: 4, label: "السنة الرابعة" },
  { value: 5, label: "السنة الخامسة" },
];