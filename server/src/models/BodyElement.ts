import { Schema, model } from "mongoose";
import { BODY_CATEGORIES } from "../types/enums.js";

const bodyElementSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, enum: BODY_CATEGORIES, required: true },
    value: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, versionKey: false, collection: "bodyelements" },
);

export const BodyElement = model("BodyElement", bodyElementSchema);
