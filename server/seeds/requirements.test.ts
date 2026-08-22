import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const requirementsPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "data",
  "requirements.json",
);

describe("requirements seed data", () => {
  const documents = JSON.parse(readFileSync(requirementsPath, "utf-8")) as Array<{
    id: string;
    ageCategory: string;
    DB: {
      minElements: number;
      maxElements: number;
      requiredElements: string[];
      maxRisks: number;
    };
    DA: { minMasteries: number; maxMasteries: number; maxAcrobatics: number };
    A: { minCharacterMoves: number; minDanceSteps: number; minDynamicEffects: number };
  }>;

  it("includes senior and junior age categories", () => {
    const categories = documents.map((doc) => doc.ageCategory).sort();
    expect(categories).toEqual(["junior", "senior"]);
  });

  it("requires jump, balance, and pivot for all categories", () => {
    for (const doc of documents) {
      expect(doc.DB.requiredElements).toEqual(
        expect.arrayContaining(["jump", "balance", "pivot"]),
      );
    }
  });

  it("gives senior higher DB caps than junior", () => {
    const senior = documents.find((doc) => doc.ageCategory === "senior")!;
    const junior = documents.find((doc) => doc.ageCategory === "junior")!;
    expect(senior.DB.maxElements).toBeGreaterThan(junior.DB.maxElements);
    expect(senior.DB.maxRisks).toBeGreaterThan(junior.DB.maxRisks);
    expect(senior.DA.maxMasteries).toBeGreaterThan(junior.DA.maxMasteries);
  });
});
