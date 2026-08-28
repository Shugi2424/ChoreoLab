import { describe, expect, it } from "vitest";
import { buildTimelineInsertOptions } from "./timelineInsertOptions";

describe("buildTimelineInsertOptions", () => {
  it("returns a single end option for an empty timeline", () => {
    expect(buildTimelineInsertOptions([])).toEqual([
      { label: "At the end (empty timeline)", insertIndex: 0 },
    ]);
  });

  it("lists beginning and after-each positions", () => {
    const options = buildTimelineInsertOptions([
      {
        id: "item-1",
        order: 0,
        type: "body_element",
        bodyElementId: "1.101",
      },
      {
        id: "item-2",
        order: 1,
        type: "risk",
        risk: { criteriaIds: [], rotations: [], value: 0 },
      },
    ]);

    expect(options).toHaveLength(3);
    expect(options[0]).toEqual({ label: "At the beginning", insertIndex: 0 });
    expect(options[1]?.insertIndex).toBe(1);
    expect(options[2]?.insertIndex).toBe(2);
  });
});
