import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { Coach } from "./Coach.js";
import { Routine } from "./Routine.js";
import {
  connectIntegrationDb,
  disconnectIntegrationDb,
} from "../test/integration/mongoMemory.js";

describe("MongoDB indexes", () => {
  beforeAll(async () => {
    await connectIntegrationDb();
    await Routine.syncIndexes();
    await Coach.syncIndexes();
  });

  afterAll(async () => {
    await disconnectIntegrationDb();
  });

  it("indexes routines by coach and updatedAt for dashboard listing", async () => {
    const indexes = await Routine.collection.listIndexes().toArray();
    const compound = indexes.find((index) => index.name === "coach_1_updatedAt_-1");

    expect(compound).toBeDefined();
    expect(compound?.key).toEqual({ coach: 1, updatedAt: -1 });
  });

  it("enforces unique coach emails", async () => {
    const indexes = await Coach.collection.listIndexes().toArray();
    const emailIndex = indexes.find((index) => index.key.email === 1);

    expect(emailIndex).toBeDefined();
    expect(emailIndex?.unique).toBe(true);
  });

  it("uses indexed find for coach-scoped routine queries", async () => {
    const coachId = new mongoose.Types.ObjectId();
    const explain = await Routine.find({ coach: coachId })
      .sort({ updatedAt: -1 })
      .explain("executionStats");

    const plan = JSON.stringify(explain);
    expect(plan).toMatch(/coach_1_updatedAt_-1|IXSCAN/i);
  });
});
