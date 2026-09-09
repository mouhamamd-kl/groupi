export interface Specialization {
  value: string;
  label: string;
}

export const SPECIALIZATIONS: Specialization[] = [
  { value: "networking", label: "شبكات" },
  { value: "software", label: "هندسة برمجيات" },
  { value: "ai", label: "ذكاء اصطناعي" },
];

export const SPEC_YEARS = [4, 5];

export function requiresSpecialization(year: number): boolean {
  return SPEC_YEARS.includes(year);
}

export function getSpecializationLabel(value: string): string | null {
  return SPECIALIZATIONS.find((spec) => spec.value === value)?.label ?? null;
}