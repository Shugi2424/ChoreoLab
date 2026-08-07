export interface ValidationResult {
  isValid: boolean;
  dbValid: boolean;
  daValid: boolean;
  artistryValid: boolean;
  missingRequirements: Array<{
    id: string;
    domain: string;
    message: string;
  }>;
  calculatedAt: string;
}

export interface Routine {
  id: string;
  gymnastName: string;
  apparatus: Apparatus;
  ageCategory: AgeCategory;
  dbScore: number;
  daScore: number;
  validation: ValidationResult;
  createdAt: string;
  updatedAt: string;
}

export type Apparatus = "hoop" | "ball" | "clubs" | "ribbon";
export type AgeCategory = "senior" | "junior";

export const APPARATUS_OPTIONS: { value: Apparatus; label: string }[] = [
  { value: "hoop", label: "Hoop" },
  { value: "ball", label: "Ball" },
  { value: "clubs", label: "Clubs" },
  { value: "ribbon", label: "Ribbon" },
];

export const AGE_CATEGORY_OPTIONS: { value: AgeCategory; label: string }[] = [
  { value: "senior", label: "Senior" },
  { value: "junior", label: "Junior" },
];

export function formatApparatus(apparatus: Apparatus): string {
  return APPARATUS_OPTIONS.find((option) => option.value === apparatus)?.label ?? apparatus;
}

export function formatAgeCategory(ageCategory: AgeCategory): string {
  return (
    AGE_CATEGORY_OPTIONS.find((option) => option.value === ageCategory)?.label ??
    ageCategory
  );
}
