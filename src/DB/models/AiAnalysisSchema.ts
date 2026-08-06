import mongoose from "mongoose";

// Schema for AI Analysis

const AiAnalysisSchema = new mongoose.Schema({
   summary: String,
   rootCause: String,
   recommendation: String,
   model: String,
   evidence: String,
   confidence: Number,
},
{
    timestamps: true
}
);

export const AiAnalysis = mongoose.models.AiAnalysis || mongoose.model("AiAnalysis", AiAnalysisSchema);