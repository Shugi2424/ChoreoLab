import { beforeEach, describe, expect, it, vi } from "vitest";
import { routineService } from "./routineService.js";

const mockSave = vi.fn();
const mockDeleteOne = vi.fn();
const mockApplyDerived = vi.fn();

const { mockFindById, mockCreate, mockFind } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockCreate: vi.fn(),
  mockFind: vi.fn(),
}));

vi.mock("../models/Routine.js", () => ({
  Routine: {
    findById: mockFindById,
    create: mockCreate,
    find: mockFind,
  },
}));

vi.mock("./routineDerivedFields.js", () => ({
  applyDerivedRoutineFields: (...args: unknown[]) => mockApplyDerived(...args),
}));

vi.mock("../utils/mappers.js", () => ({
  toGraphQLRoutine: (doc: object) => doc,
}));

function buildRoutineDoc(overrides: Record<string, unknown> = {}) {
  const doc = {
    coach: { toString: () => "coach-1" },
    gymnastName: "Alex",
    apparatus: "hoop",
    ageCategory: "senior",
    timeline: [],
    dbScore: 1,
    daScore: 0.5,
    validation: { isValid: false },
    save: mockSave,
    deleteOne: mockDeleteOne,
    toObject() {
      return {
        id: "routine-1",
        gymnastName: doc.gymnastName,
        apparatus: doc.apparatus,
        ageCategory: doc.ageCategory,
      };
    },
    ...overrides,
  };
  return doc;
}

describe("routineService.update", () => {
  beforeEach(() => {
    mockFindById.mockReset();
    mockSave.mockReset();
    mockApplyDerived.mockReset();
    mockApplyDerived.mockResolvedValue(undefined);
    mockSave.mockResolvedValue(undefined);
  });

  it("updates age category and recalculates derived fields", async () => {
    const routine = buildRoutineDoc();
    mockFindById.mockResolvedValue(routine);

    const result = await routineService.update("coach-1", "routine-1", {
      ageCategory: "junior",
    });

    expect(routine.ageCategory).toBe("junior");
    expect(mockApplyDerived).toHaveBeenCalledWith(routine);
    expect(mockSave).toHaveBeenCalled();
    expect(result).toMatchObject({ ageCategory: "junior" });
  });

  it("rejects empty update payloads", async () => {
    await expect(routineService.update("coach-1", "routine-1", {})).rejects.toThrow(
      "No routine fields to update.",
    );
  });
});
