import { describe, expect, it } from "vitest";
import {
  ALTERNATE_CATCH_BASE_IDS,
  CATCH_FROM_HIGH_THROW_BASE_ID,
  getMasteryBaseCombinationError,
} from "./masteryRules.js";

describe("getMasteryBaseCombinationError", () => {
  it("rejects alternate catch bases with catch-from-high-throw", () => {
    expect(
      getMasteryBaseCombinationError([
        CATCH_FROM_HIGH_THROW_BASE_ID,
        ALTERNATE_CATCH_BASE_IDS[0],
      ]),
    ).toMatch(/Alternate catch bases/);
  });

  it("accepts single catch-from-high-throw base", () => {
    expect(getMasteryBaseCombinationError([CATCH_FROM_HIGH_THROW_BASE_ID])).toBeNull();
  });
});
