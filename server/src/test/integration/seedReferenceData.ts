import { BodyElement } from "../../models/BodyElement.js";
import { Requirement } from "../../models/Requirement.js";
import { ArtistryComponent } from "../../models/reference.js";

async function upsertOne<T extends { id: string }>(
  model: { replaceOne: (filter: { id: string }, doc: T, options: { upsert: boolean }) => Promise<unknown> },
  doc: T,
) {
  await model.replaceOne({ id: doc.id }, doc, { upsert: true });
}

export async function seedIntegrationReferenceData(): Promise<void> {
  await upsertOne(BodyElement, {
    id: "1.101",
    name: "Tuck jump with one turn 360°",
    category: "jump",
    value: 0.1,
  });
  await upsertOne(BodyElement, {
    id: "2.101",
    name: "Front balance",
    category: "balance",
    value: 0.1,
  });

  await upsertOne(Requirement, {
    id: "requirements-senior",
    ageCategory: "senior",
    DB: {
      minElements: 3,
      maxElements: 8,
      requiredElements: ["jump", "balance", "pivot"],
      maxRisks: 4,
    },
    DA: {
      minMasteries: 0,
      maxMasteries: 15,
      maxAcrobatics: 3,
    },
    A: {
      minCharacterMoves: 20,
      minDanceSteps: 2,
      minDynamicEffects: 2,
    },
  });

  await upsertOne(ArtistryComponent, {
    id: "character-moment",
    name: "Character moment",
    type: "character",
  });
}
