import { Schema, model, Types } from "mongoose";
import { AGE_CATEGORIES, APPARATUS } from "../types/enums.js";

const riskRotationSchema = new Schema(
  {
    rotationId: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const riskSchema = new Schema(
  {
    criteriaIds: { type: [String], default: [] },
    rotations: { type: [riskRotationSchema], default: [] },
    value: { type: Number, default: 0.2 },
  },
  { _id: false },
);

const masterySchema = new Schema(
  {
    baseIds: { type: [String], required: true },
    criteriaIds: { type: [String], required: true },
    rotationId: { type: String },
    value: { type: Number, default: 0 },
    isAcro: { type: Boolean, default: false },
  },
  { _id: false },
);

const missingRequirementSchema = new Schema(
  {
    id: { type: String, required: true },
    domain: { type: String, required: true },
    message: { type: String, required: true },
  },
  { _id: false },
);

const validationResultSchema = new Schema(
  {
    isValid: { type: Boolean, default: false },
    dbValid: { type: Boolean, default: false },
    daValid: { type: Boolean, default: false },
    artistryValid: { type: Boolean, default: false },
    missingRequirements: { type: [missingRequirementSchema], default: [] },
    calculatedAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const routineItemSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["body_element", "risk", "mastery", "artistry"],
      required: true,
    },
    order: { type: Number, required: true },
    bodyElementId: { type: String },
    risk: { type: riskSchema },
    mastery: { type: masterySchema },
    artistryComponentId: { type: String },
  },
  { _id: true },
);

const routineSchema = new Schema(
  {
    coach: {
      type: Schema.Types.ObjectId,
      ref: "Coach",
      required: true,
      index: true,
    },
    gymnastName: { type: String, required: true, trim: true },
    apparatus: { type: String, enum: APPARATUS, required: true },
    ageCategory: { type: String, enum: AGE_CATEGORIES, required: true },
    timeline: { type: [routineItemSchema], default: [] },
    dbScore: { type: Number, default: 0 },
    daScore: { type: Number, default: 0 },
    validation: {
      type: validationResultSchema,
      default: () => ({
        isValid: false,
        dbValid: false,
        daValid: false,
        artistryValid: false,
        missingRequirements: [],
        calculatedAt: new Date(),
      }),
    },
  },
  { timestamps: true, versionKey: false, collection: "routines" },
);

routineSchema.index({ coach: 1, updatedAt: -1 });

export interface RoutineDocument {
  _id: Types.ObjectId;
  coach: Types.ObjectId;
  gymnastName: string;
  apparatus: string;
  ageCategory: string;
  timeline: unknown[];
  dbScore: number;
  daScore: number;
  validation: {
    isValid: boolean;
    dbValid: boolean;
    daValid: boolean;
    artistryValid: boolean;
    missingRequirements: Array<{
      id: string;
      domain: string;
      message: string;
    }>;
    calculatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const Routine = model("Routine", routineSchema);
