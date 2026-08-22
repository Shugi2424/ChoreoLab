/** Client mirror of server pivot rotation rules (CoP §12.2.5–12.2.8). */

export type PivotTurnUnit = "360" | "180";

export interface PivotRotationRule {
  turnUnit: PivotTurnUnit;
  incrementPerTurn: number | null;
  turnLabel: string;
}

const PIVOT_NO_ADDITIONAL_IDS = new Set(["3.2101", "3.2202"]);
const PIVOT_INCREMENT_010_360_PREFIXES = ["3.1105"];
const PIVOT_INCREMENT_010_360_IDS = new Set(["3.1801", "3.1902"]);
const PIVOT_FOUETTE_PREFIX = "3.160";
const PIVOT_BASE_180_INCREMENT_010_PREFIX = "3.2003";
const PIVOT_BASE_180_INCREMENT_020_PREFIXES = ["3.505", "3.804", "3.805", "3.1405"];

export function roundCopValue(value: number): number {
  return Math.round(value * 10) / 10;
}

export function getPivotRotationRule(elementId: string, baseValue: number): PivotRotationRule {
  if (PIVOT_NO_ADDITIONAL_IDS.has(elementId)) {
    return {
      turnUnit: "360",
      incrementPerTurn: null,
      turnLabel: "360° rotations (no extra value beyond base)",
    };
  }

  if (elementId.startsWith(PIVOT_BASE_180_INCREMENT_010_PREFIX)) {
    return {
      turnUnit: "180",
      incrementPerTurn: 0.1,
      turnLabel: "180° rotations",
    };
  }

  for (const prefix of PIVOT_BASE_180_INCREMENT_020_PREFIXES) {
    if (elementId.startsWith(prefix)) {
      return {
        turnUnit: "180",
        incrementPerTurn: 0.2,
        turnLabel: "180° rotations",
      };
    }
  }

  if (
    baseValue === 0.1 ||
    elementId.startsWith(PIVOT_FOUETTE_PREFIX) ||
    PIVOT_INCREMENT_010_360_IDS.has(elementId) ||
    PIVOT_INCREMENT_010_360_PREFIXES.some((prefix) => elementId.startsWith(prefix))
  ) {
    return {
      turnUnit: "360",
      incrementPerTurn: 0.1,
      turnLabel: "360° rotations",
    };
  }

  if (baseValue >= 0.2) {
    return {
      turnUnit: "360",
      incrementPerTurn: 0.2,
      turnLabel: "360° rotations",
    };
  }

  return {
    turnUnit: "360",
    incrementPerTurn: 0.1,
    turnLabel: "360° rotations",
  };
}

export function calculatePivotValue(
  baseValue: number,
  rule: PivotRotationRule,
  turnCount: number,
): number {
  if (!Number.isInteger(turnCount) || turnCount < 1) {
    return baseValue;
  }
  if (rule.incrementPerTurn == null) {
    return roundCopValue(baseValue);
  }
  const additionalTurns = Math.max(0, turnCount - 1);
  return roundCopValue(baseValue + additionalTurns * rule.incrementPerTurn);
}

export function formatPivotRotationHint(
  baseValue: number,
  rule: PivotRotationRule,
  turnCount: number,
): string {
  const value = calculatePivotValue(baseValue, rule, turnCount);
  if (rule.incrementPerTurn == null) {
    return `Value: ${value.toFixed(1)} (fixed base)`;
  }
  const unit = rule.turnUnit === "180" ? "180°" : "360°";
  const minUnit = rule.turnUnit === "180" ? "180°" : "360°";
  const additional = Math.max(0, turnCount - 1);
  if (additional === 0) {
    return `Value: ${value.toFixed(1)} (base ${minUnit})`;
  }
  return `Value: ${value.toFixed(1)} (base ${minUnit} + ${additional}×${rule.incrementPerTurn.toFixed(1)} per extra ${unit})`;
}

export function validatePivotTurnCount(rule: PivotRotationRule, turnCount: number): string | null {
  if (!Number.isInteger(turnCount) || turnCount < 1) {
    return "Enter at least 1 rotation.";
  }
  if (rule.incrementPerTurn == null && turnCount > 1) {
    return "This pivot does not award extra value for additional rotations.";
  }
  return null;
}
