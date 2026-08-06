import { Schema, model, type InferSchemaType } from "mongoose";

const elementSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    apparatus: {
      type: String,
      enum: ["hoop", "ball", "clubs", "ribbon", "rope", "none"],
      required: true,
    },
    category: { type: String, required: true },
    difficulty: { type: Number, required: true, min: 0 },
    description: { type: String },
  },
  { timestamps: true },
);

export type ElementDocument = InferSchemaType<typeof elementSchema>;
export const Element = model("Element", elementSchema);
