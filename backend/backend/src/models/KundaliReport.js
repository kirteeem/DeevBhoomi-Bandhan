import mongoose from "mongoose";

const kundaliReportSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "KundaliRequest", required: true, unique: true },
    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Priest", required: true },
    gunMilanScore: { type: Number, min: 0, max: 36 },
    manglikDosha: { type: String, enum: ["none", "partial", "full"] },
    summary: String,
    recommendation: { type: String, enum: ["favourable", "favourable_with_remedy", "not_recommended"] },
    reportFileUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model("KundaliReport", kundaliReportSchema);
