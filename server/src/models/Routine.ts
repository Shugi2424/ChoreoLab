import { Schema, model, Types } from "mongoose";
import { AGE_CATEGORIES, APPARATUS } from "../types/enums.js";

const missingRequirementSchema = new Schema(
  {
    code: { type: String, required: true },
    domain: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ["error", "warning"], required: true },
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
    timeline: { type: [Schema.Types.Mixed], default: [] },
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
      code: string;
      domain: string;
      message: string;
      severity: "error" | "warning";
    }>;
    calculatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const Routine = model("Routine", routineSchema);
