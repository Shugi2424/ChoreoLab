import { describe, expect, it } from "vitest";
import { sortRotations } from "./rotationSort.js";

const rotations = [
  { id: "acro-illusion", name: "Illusion", group: "acro-13" },
  { id: "v2-seated", name: "Seated", group: "v2" },
  { id: "acro-cartwheel", name: "Cartwheel", group: "acro-3" },
  { id: "v1-upright", name: "Upright", group: "v1" },
  { id: "v3-lateral", name: "Lateral roll", group: "v3" },
  { id: "acro-walkover-forward", name: "Walkover forward", group: "acro-1" },
];

describe("sortRotations", () => {
  it("orders v1, v2, v3, then acro-1 through acro-13", () => {
    expect(sortRotations(rotations).map((rotation) => rotation.group)).toEqual([
      "v1",
      "v2",
      "v3",
      "acro-1",
      "acro-3",
      "acro-13",
    ]);
  });
});
