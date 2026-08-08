import mongoose from "mongoose";
// Log Schema
const LogSchema = new mongoose.Schema({
    projectId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Project",
       required: true,
       index: true
    },
    service:{
       type: String,
       required: true,
    },
    level: {
        type: String,
        enum: ["INFO","WARN", "ERROR", "DEBUG"],
        required: true,
    },
    message: {
        type: String,
        required: true, 
    },
    environment : {
        type: String,
        enum: ["development", "staging", "production"],
        default: "production",
    },
    metadata:{
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },   
},
{timestamps: true}
);

export const Log = mongoose.models.Log ||  mongoose.model("Log", LogSchema);