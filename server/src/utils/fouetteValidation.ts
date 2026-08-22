/** Fouetté pivot (Table #13) and balance (Table #11) — at most one of each per routine. */

const FOUETTE_PIVOT_PREFIX = "3.160";
const FOUETTE_BALANCE_PREFIX = "2.180";

export function isFouettePivotBodyElement(elementId: string): boolean {
  return elementId.startsWith(FOUETTE_PIVOT_PREFIX);
}

export function isFouetteBalanceBodyElement(elementId: string): boolean {
  return elementId.startsWith(FOUETTE_BALANCE_PREFIX);
}

export interface FouetteValidationIssue {
  id: string;
  message: string;
}

export function validateFouetteBodyElements(
  timeline: ReadonlyArray<{ type: string; bodyElementId?: string | null }>,
): FouetteValidationIssue[] {
  let fouettePivotCount = 0;
  let fouetteBalanceCount = 0;

  for (const item of timeline) {
    if (item.type !== "body_element" || !item.bodyElementId) {
      continue;
    }
    if (isFouettePivotBodyElement(item.bodyElementId)) {
      fouettePivotCount++;
    } else if (isFouetteBalanceBodyElement(item.bodyElementId)) {
      fouetteBalanceCount++;
    }
  }

  const issues: FouetteValidationIssue[] = [];

  if (fouettePivotCount > 1) {
    issues.push({
      id: "multiple-fouette-pivots",
      message:
        "Only one Fouetté pivot is allowed per routine — remove the extra Fouetté pivot body element.",
    });
  }

  if (fouetteBalanceCount > 1) {
    issues.push({
      id: "multiple-fouette-balances",
      message:
        "Only one Fouetté balance is allowed per routine — remove the extra Fouetté balance body element.",
    });
  }

  return issues;
}
