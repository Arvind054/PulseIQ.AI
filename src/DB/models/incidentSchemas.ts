import mongoose, { model } from "mongoose";

// Incident Schema

export const IncidentSchema = new mongoose.Schema({
     
    projectId:{
       type: mongoose.Schema.Types.ObjectId,
       ref: "Project",
       required: true,
    },
    title: {
        type: String,
        required: true,
    },
    serverity:{
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        required: true,
    },
    status: {
        type: String,
        enum: ["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"],
        default: "OPEN",
    },
    firstSeen: Date,
    lastSeen: Date,
    summary:{
        type: String,
        default: "",
    },
    rootCause: {
        type: String,
        default: "",
    },
    aiSuggestions:{
        type: mongoose.Schema.Types.ObjectId,
           ref: "AiAnalysis",
           required: true,
    },
    relatedLogs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Log",
    },],
},
{timestamps: true}
);

export const Incident = mongoose.models.Incident || mongoose.model("Incident", IncidentSchema);