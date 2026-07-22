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
        enum: ["OPEN", "INVESTIGATING", "RESOLVED"],
        default: "OPEN",
    },
    summary:{
        type: String,
        default: "",
    },
    rootCause: {
        type: String,
        default: "",
    },
    aiSuggestions:{
        type: String,
        default: "",
    },
    relatedLogs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Log",
    },],
},
{timestamps: true}
);

export const Incident = mongoose.models.Incident || mongoose.model("Incident", IncidentSchema);