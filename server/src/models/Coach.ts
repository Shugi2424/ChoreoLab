import { Schema, model } from "mongoose";

const coachSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    club: { type: String, trim: true },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true, versionKey: false, collection: "coaches" },
);

export const Coach = model("Coach", coachSchema);
