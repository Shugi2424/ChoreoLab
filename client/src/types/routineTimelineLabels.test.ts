// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import type { RoutineItem } from "./routine";
import {
  getRoutineItemTimelineMeta,
  getRoutineItemTimelinePrimary,
} from "./routine";

describe("routine timeline labels", () => {
  it("formats body element primary and meta with category and value", () => {
    const item: RoutineItem = {
      id: "item-1",
      type: "body_element",
      order: 0,
      bodyElement: {
        id: "be-1",
        name: "Tuck jump with hoop",
        category: "jump",
        value: 0.1,
      },
      bodyElementConfig: { value: 0.1 },
    };

    expect(getRoutineItemTimelinePrimary(item)).toBe("Tuck jump with hoop");
    expect(getRoutineItemTimelineMeta(item)).toBe("Body element (DB) · Jump · 0.1");
  });

  it("includes pivot turn count in body element meta", () => {
    const item: RoutineItem = {
      id: "item-2",
      type: "body_element",
      order: 1,
      bodyElement: {
        id: "be-2",
        name: "Pivot on hoop",
        category: "pivot",
        value: 0.3,
      },
      bodyElementConfig: { rotationCount: 2, value: 0.3 },
    };

    expect(getRoutineItemTimelineMeta(item)).toBe("Body element (DB) · Pivot · 2 turns · 0.3");
  });

  it("formats risk and mastery meta with CoP values", () => {
    const risk: RoutineItem = {
      id: "item-3",
      type: "risk",
      order: 2,
      risk: { criteriaIds: [], rotations: [], value: 0.4 },
    };
    const mastery: RoutineItem = {
      id: "item-4",
      type: "mastery",
      order: 3,
      mastery: {
        baseIds: [],
        criteriaIds: [],
        value: 0.5,
        isAcro: false,
      },
    };

    expect(getRoutineItemTimelinePrimary(risk)).toBe("Risk");
    expect(getRoutineItemTimelineMeta(risk)).toBe("Risk (DB) · 0.4");
    expect(getRoutineItemTimelinePrimary(mastery)).toBe("Mastery");
    expect(getRoutineItemTimelineMeta(mastery)).toBe("Apparatus (DA) · 0.5");
  });

  it("uses artistry component name on the primary line", () => {
    const item: RoutineItem = {
      id: "item-5",
      type: "artistry",
      order: 4,
      artistryComponent: {
        id: "art-1",
        name: "High throw and catch",
        type: "throw",
      },
    };

    expect(getRoutineItemTimelinePrimary(item)).toBe("High throw and catch");
    expect(getRoutineItemTimelineMeta(item)).toBe("Artistry (A)");
  });
});
