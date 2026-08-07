import "dotenv/config";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { BodyElement } from "../src/models/BodyElement.js";
import { Requirement } from "../src/models/Requirement.js";
import {
  Base,
  DACriteria,
  RCriteria,
  Rotation,
  ArtistryComponent,
} from "../src/models/reference.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/choreolab";

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
  await RCriteria.updateMany({}, { $unset: { __v: 1 } });
  await Rotation.updateMany({}, { $unset: { __v: 1 } });
  await ArtistryComponent.updateMany({}, { $unset: { __v: 1 } });
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
  const criteria =
    await loadJson<Array<{ id: string; name: string }>>("da-criteria.json");

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

  console.log(
    `Seeded ${bases.length} DA bases (removed ${removed.deletedCount} stale)`,
  );
}

async function seedRCriteria() {
  const criteria = await loadJson<
    Array<{
      id: string;
      name: string;
      type: string;
      value: number;
      apparatuses: string[];
    }>
  >("rcriteria.json");

  for (const criterion of criteria) {
    await RCriteria.replaceOne({ id: criterion.id }, criterion, { upsert: true });
  }

  const seededIds = criteria.map((c) => c.id);
  const removed = await RCriteria.deleteMany({ id: { $nin: seededIds } });

  console.log(
    `Seeded ${criteria.length} R criteria (removed ${removed.deletedCount} stale)`,
  );
}

async function seedRotations() {
  const rotations = await loadJson<
    Array<{
      id: string;
      name: string;
      group: string;
    }>
  >("rotations.json");

  for (const rotation of rotations) {
    await Rotation.replaceOne({ id: rotation.id }, rotation, { upsert: true });
  }

  const seededIds = rotations.map((r) => r.id);
  const removed = await Rotation.deleteMany({ id: { $nin: seededIds } });

  console.log(
    `Seeded ${rotations.length} rotations (removed ${removed.deletedCount} stale)`,
  );
}

async function seedArtistryComponents() {
  const components = await loadJson<
    Array<{
      id: string;
      name: string;
      type: string;
    }>
  >("artistry-components.json");

  for (const component of components) {
    await ArtistryComponent.replaceOne({ id: component.id }, component, {
      upsert: true,
    });
  }

  const seededIds = components.map((c) => c.id);
  const removed = await ArtistryComponent.deleteMany({
    id: { $nin: seededIds },
  });

  console.log(
    `Seeded ${components.length} artistry components (removed ${removed.deletedCount} stale)`,
  );
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  await dropLegacyCollections();
  await seedBodyElements();
  await seedRequirements();
  await seedDACriteria();
  await seedBases();
  await seedRCriteria();
  await seedRotations();
  await seedArtistryComponents();
  await stripVersionKeys();

  const bodyCount = await BodyElement.countDocuments();
  const reqCount = await Requirement.countDocuments();
  const criteriaCount = await DACriteria.countDocuments();
  const baseCount = await Base.countDocuments();
  const rCriteriaCount = await RCriteria.countDocuments();
  const rotationCount = await Rotation.countDocuments();
  const artistryCount = await ArtistryComponent.countDocuments();
  console.log(
    `Done. bodyelements: ${bodyCount}, requirements: ${reqCount}, dacriteria: ${criteriaCount}, bases: ${baseCount}, rcriteria: ${rCriteriaCount}, rotations: ${rotationCount}, artistrycomponents: ${artistryCount}`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
