import { Schema, model } from "mongoose";
import { AGE_CATEGORIES, BODY_CATEGORIES } from "../types/enums.js";

const dbRequirementSchema = new Schema(
  {
    minElements: { type: Number, required: true },
    maxElements: { type: Number, required: true },
    requiredElements: {
      type: [String],
      enum: BODY_CATEGORIES,
      required: true,
    },
    maxRisks: { type: Number, required: true },
  },
  { _id: false },
);

const daRequirementSchema = new Schema(
  {
    minMasteries: { type: Number, required: true },
    maxMasteries: { type: Number, required: true },
    maxAcrobatics: { type: Number, required: true },
  },
  { _id: false },
);

const artistryRequirementSchema = new Schema(
  {
    minCharacterMoves: { type: Number, required: true },
    minDanceSteps: { type: Number, required: true },
    minDynamicEffects: { type: Number, required: true },
  },
  { _id: false },
);

const requirementSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    ageCategory: { type: String, enum: AGE_CATEGORIES, required: true, unique: true },
    DB: { type: dbRequirementSchema, required: true },
    DA: { type: daRequirementSchema, required: true },
    A: { type: artistryRequirementSchema, required: true },
  },
  { timestamps: true, versionKey: false, collection: "requirements" },
);

export const Requirement = model("Requirement", requirementSchema);
