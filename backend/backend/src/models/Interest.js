import mongoose from "mongoose";

const interestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "declined", "withdrawn"], default: "pending" },
    message: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

interestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export default mongoose.model("Interest", interestSchema);
