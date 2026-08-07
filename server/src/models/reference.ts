import { Schema, model } from "mongoose";
import { APPARATUS, ARTISTRY_TYPES } from "../types/enums.js";

const artistryComponentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ARTISTRY_TYPES, required: true },
  },
  { timestamps: true, versionKey: false, collection: "artistrycomponents" },
);

export const ArtistryComponent = model(
  "ArtistryComponent",
  artistryComponentSchema,
);

// Placeholder models — expanded in later milestones
const baseSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    value: { type: Number, required: true },
    apparatuses: { type: [String], enum: APPARATUS, required: true },
    allowedCriteria: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false, collection: "bases" },
);

export const Base = model("Base", baseSchema);

const daCriteriaSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: true, versionKey: false, collection: "dacriteria" },
);

export const DACriteria = model("DACriteria", daCriteriaSchema);

const rCriteriaSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["throw", "catch", "general"], required: true },
    apparatus: { type: String, enum: APPARATUS, required: true },
  },
  { timestamps: true, versionKey: false, collection: "rcriteria" },
);

export const RCriteria = model("RCriteria", rCriteriaSchema);

const rotationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["v1", "v2", "v3", "acro"], required: true },
  },
  { timestamps: true, versionKey: false, collection: "rotations" },
);

export const Rotation = model("Rotation", rotationSchema);
