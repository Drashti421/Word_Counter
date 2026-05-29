import mongoose, { Schema, type InferSchemaType } from "mongoose";

const historyItemSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    wordCount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export type HistoryItemDoc = InferSchemaType<typeof historyItemSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const HistoryItemModel = mongoose.model("HistoryItem", historyItemSchema);
