import "dotenv/config";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { BodyElement } from "../src/models/BodyElement.js";
import { Requirement } from "../src/models/Requirement.js";
import { Base, DACriteria } from "../src/models/reference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/choreolab";

async function loadJson<T>(filename: string): Promise<T> {
  const path = join(__dirname, "data", filename);
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as T;
}

async function dropLegacyCollections() {
  const db = mongoose.connection.db;
  if (!db) return;

  const legacy = await db.listCollections({ name: "elements" }).toArray();
  if (legacy.length > 0) {
    await db.dropCollection("elements");
    console.log("Dropped legacy elements collection");
  }
}

async function stripVersionKeys() {
  await BodyElement.updateMany({}, { $unset: { __v: 1 } });
  await Requirement.updateMany({}, { $unset: { __v: 1 } });
  await Base.updateMany({}, { $unset: { __v: 1 } });
  await DACriteria.updateMany({}, { $unset: { __v: 1 } });
}

async function seedBodyElements() {
  const elements = await loadJson<
    Array<{
      id: string;
      name: string;
      category: string;
      value: number;
    }>
  >("body-elements.json");

  for (const element of elements) {
    await BodyElement.replaceOne({ id: element.id }, element, {
      upsert: true,
    });
  }

  console.log(`Seeded ${elements.length} body elements`);
}

async function seedRequirements() {
  const requirements = await loadJson<
    Array<{
      id: string;
      ageCategory: string;
      DB: Record<string, unknown>;
      DA: Record<string, unknown>;
      A: Record<string, unknown>;
    }>
  >("requirements.json");

  for (const req of requirements) {
    await Requirement.replaceOne({ id: req.id }, req, { upsert: true });
  }

  console.log(`Seeded ${requirements.length} requirement documents`);
}

async function seedDACriteria() {
  const criteria = await loadJson<
    Array<{ id: string; name: string }>
  >("da-criteria.json");

  for (const criterion of criteria) {
    await DACriteria.replaceOne({ id: criterion.id }, criterion, {
      upsert: true,
    });
  }

  console.log(`Seeded ${criteria.length} DA criteria`);
}

async function seedBases() {
  const bases = await loadJson<
    Array<{
      id: string;
      name: string;
      value: number;
      apparatuses: string[];
      allowedCriteria: string[];
    }>
  >("bases.json");

  for (const base of bases) {
    await Base.replaceOne({ id: base.id }, base, { upsert: true });
  }

  const seededIds = bases.map((b) => b.id);
  const removed = await Base.deleteMany({ id: { $nin: seededIds } });

  console.log(`Seeded ${bases.length} DA bases (removed ${removed.deletedCount} stale)`);
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  await dropLegacyCollections();
  await seedBodyElements();
  await seedRequirements();
  await seedDACriteria();
  await seedBases();
  await stripVersionKeys();

  const bodyCount = await BodyElement.countDocuments();
  const reqCount = await Requirement.countDocuments();
  const criteriaCount = await DACriteria.countDocuments();
  const baseCount = await Base.countDocuments();
  console.log(
    `Done. bodyelements: ${bodyCount}, requirements: ${reqCount}, dacriteria: ${criteriaCount}, bases: ${baseCount}`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
