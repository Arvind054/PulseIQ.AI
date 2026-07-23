import mongoose from "mongoose";

// Schema for AI Analysis

const AiAnalysisSchema = new mongoose.Schema({
   incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Incident",
    required: true,
   },
   summary: String,
   rootCause: String,
   recommendation: String,
   model: String,
   toeknsUsed: Number,
},
{
    timestamps: true
}
);

export const AiAnalysis = mongoose.models.AiAnalysis || mongoose.model("AiAnalysis", AiAnalysisSchema);