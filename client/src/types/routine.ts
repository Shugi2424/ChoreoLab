export type RoutineItemType = "body_element" | "risk" | "mastery" | "artistry";

export interface BodyElementRef {
  id: string;
  name: string;
  category: string;
  value: number;
}

export interface ArtistryComponentRef {
  id: string;
  name: string;
  type: string;
}

export interface RiskRotation {
  rotationId: string;
  count: number;
}

export interface RiskData {
  criteriaIds: string[];
  rotations: RiskRotation[];
  bodyElementId?: string | null;
  value: number;
}

export interface MasteryData {
  baseIds: string[];
  criteriaIds: string[];
  rotationId?: string | null;
  value: number;
  isAcro: boolean;
}

export interface RoutineItem {
  id: string;
  type: RoutineItemType;
  order: number;
  bodyElementId?: string | null;
  bodyElement?: BodyElementRef | null;
  risk?: RiskData | null;
  mastery?: MasteryData | null;
  artistryComponentId?: string | null;
  artistryComponent?: ArtistryComponentRef | null;
}

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
  timeline: RoutineItem[];
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

export function getRoutineItemLabel(item: RoutineItem): string {
  switch (item.type) {
    case "body_element":
      return item.bodyElement?.name ?? item.bodyElementId ?? "Body element";
    case "artistry":
      return item.artistryComponent?.name ?? item.artistryComponentId ?? "Artistry";
    case "risk":
      return `Risk (${item.risk?.value.toFixed(1) ?? "0.0"})`;
    case "mastery":
      return `Mastery (${item.mastery?.value.toFixed(1) ?? "0.0"})`;
    default:
      return item.type;
  }
}

export function getRoutineItemTypeLabel(type: RoutineItemType): string {
  switch (type) {
    case "body_element":
      return "Body element";
    case "risk":
      return "Risk";
    case "mastery":
      return "Mastery";
    case "artistry":
      return "Artistry";
  }
}
