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

  const seededIds = elements.map((element) => element.id);
  const removed = await BodyElement.deleteMany({ id: { $nin: seededIds } });

  console.log(
    `Seeded ${elements.length} body elements (removed ${removed.deletedCount} stale)`,
  );
  return elements.length;
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

  const seededIds = requirements.map((req) => req.id);
  const removed = await Requirement.deleteMany({ id: { $nin: seededIds } });

  console.log(
    `Seeded ${requirements.length} requirement documents (removed ${removed.deletedCount} stale)`,
  );
  return requirements.length;
}

async function seedDACriteria() {
  const criteria =
    await loadJson<Array<{ id: string; name: string }>>("da-criteria.json");

  for (const criterion of criteria) {
    await DACriteria.replaceOne({ id: criterion.id }, criterion, {
      upsert: true,
    });
  }

  const seededIds = criteria.map((criterion) => criterion.id);
  const removed = await DACriteria.deleteMany({ id: { $nin: seededIds } });

  console.log(
    `Seeded ${criteria.length} DA criteria (removed ${removed.deletedCount} stale)`,
  );
  return criteria.length;
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
  return bases.length;
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
  return criteria.length;
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
  return rotations.length;
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
  return components.length;
}

async function verifyCounts(expected: Record<string, number>) {
  const actual = {
    bodyelements: await BodyElement.countDocuments(),
    requirements: await Requirement.countDocuments(),
    dacriteria: await DACriteria.countDocuments(),
    bases: await Base.countDocuments(),
    rcriteria: await RCriteria.countDocuments(),
    rotations: await Rotation.countDocuments(),
    artistrycomponents: await ArtistryComponent.countDocuments(),
  };

  const mismatches = Object.entries(expected).filter(
    ([collection, count]) => actual[collection as keyof typeof actual] !== count,
  );

  if (mismatches.length > 0) {
    for (const [collection, count] of mismatches) {
      console.error(
        `Verification failed: ${collection} expected ${count}, got ${actual[collection as keyof typeof actual]}`,
      );
    }
    throw new Error("Seed verification failed — counts do not match seed files");
  }

  console.log("Verification passed — all collection counts match seed files");
  console.log(
    `  bodyelements: ${actual.bodyelements}, requirements: ${actual.requirements}, dacriteria: ${actual.dacriteria}, bases: ${actual.bases}, rcriteria: ${actual.rcriteria}, rotations: ${actual.rotations}, artistrycomponents: ${actual.artistrycomponents}`,
  );
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  await dropLegacyCollections();

  const expectedCounts = {
    bodyelements: await seedBodyElements(),
    requirements: await seedRequirements(),
    dacriteria: await seedDACriteria(),
    bases: await seedBases(),
    rcriteria: await seedRCriteria(),
    rotations: await seedRotations(),
    artistrycomponents: await seedArtistryComponents(),
  };

  await stripVersionKeys();
  await verifyCounts(expectedCounts);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
