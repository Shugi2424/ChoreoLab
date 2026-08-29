import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { Coach } from "../models/Coach.js";
import { clearAuthRateLimits } from "../middleware/authRateLimit.js";
import { routineService } from "./routineService.js";
import { routineTimelineService } from "./routineTimelineService.js";
import { clearRequirementsCache } from "./requirementsCache.js";
import { hashPassword } from "../utils/password.js";
import {
  clearIntegrationCollections,
  connectIntegrationDb,
  disconnectIntegrationDb,
} from "../test/integration/mongoMemory.js";
import { seedIntegrationReferenceData } from "../test/integration/seedReferenceData.js";

async function createCoach(email: string) {
  return Coach.create({
    email,
    passwordHash: await hashPassword("coach1234"),
    firstName: "Test",
    lastName: "Coach",
  });
}

describe("routineTimelineService integration", () => {
  beforeAll(async () => {
    await connectIntegrationDb();
  });

  afterAll(async () => {
    await disconnectIntegrationDb();
  });

  beforeEach(async () => {
    clearRequirementsCache();
    clearAuthRateLimits();
    await clearIntegrationCollections();
    await seedIntegrationReferenceData();
  });

  it("adds a body element and recalculates DB score and validation", async () => {
    const coach = await createCoach("timeline-coach@test.com");
    const routine = await routineService.create(coach._id.toString(), {
      gymnastName: "Alex",
      apparatus: "hoop",
      ageCategory: "senior",
    });

    expect(routine.dbScore).toBe(0);

    const updated = await routineTimelineService.addItem(
      coach._id.toString(),
      routine.id,
      { type: "body_element", bodyElementId: "1.101" },
    );

    expect(updated.timeline).toHaveLength(1);
    expect(updated.timeline[0]?.type).toBe("body_element");
    expect(updated.dbScore).toBeGreaterThan(0);
    expect(updated.validation.calculatedAt).toBeTruthy();
    expect(updated.validation.dbValid).toBe(false);
  });

  it("reorders timeline items and preserves derived scores", async () => {
    const coach = await createCoach("reorder-coach@test.com");
    const routine = await routineService.create(coach._id.toString(), {
      gymnastName: "Jordan",
      apparatus: "ball",
      ageCategory: "senior",
    });

    const withItems = await routineTimelineService.addItem(
      coach._id.toString(),
      routine.id,
      { type: "body_element", bodyElementId: "1.101" },
    );
    const second = await routineTimelineService.addItem(
      coach._id.toString(),
      withItems.id,
      { type: "body_element", bodyElementId: "2.101" },
    );

    const itemIds = second.timeline.map((item) => item.id).reverse();
    const reordered = await routineTimelineService.reorderItems(
      coach._id.toString(),
      second.id,
      itemIds,
    );

    expect(reordered.timeline.map((item) => item.bodyElementId)).toEqual(["2.101", "1.101"]);
    expect(reordered.dbScore).toBe(second.dbScore);
  });

  it("removes a timeline item and recalculates scores", async () => {
    const coach = await createCoach("remove-coach@test.com");
    const routine = await routineService.create(coach._id.toString(), {
      gymnastName: "Sam",
      apparatus: "ribbon",
      ageCategory: "senior",
    });

    const withItem = await routineTimelineService.addItem(
      coach._id.toString(),
      routine.id,
      { type: "body_element", bodyElementId: "1.101" },
    );
    const itemId = withItem.timeline[0]?.id;
    expect(itemId).toBeTruthy();

    const updated = await routineTimelineService.removeItem(
      coach._id.toString(),
      withItem.id,
      itemId!,
    );

    expect(updated.timeline).toHaveLength(0);
    expect(updated.dbScore).toBe(0);
  });
});
