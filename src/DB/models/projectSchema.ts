import mongoose from "mongoose";
// Project Schema
const ProjectSchema = new mongoose.Schema({
     ownerId: {
        type:String,
        required: true,
        indexed: true,
     },
     name:{
        type: String,
        required: true,
     },
     apiKey:{
        type: String,
        required: true,
        unique: true,
     },
     description:{
        type: String,
        default: "",
     },
},
 {timestamps: true}
);

export const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);