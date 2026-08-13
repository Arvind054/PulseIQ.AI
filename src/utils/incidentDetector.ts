import mongoose from "mongoose";
import { connectDB } from "../DB/DbConnection";
import { Log } from "../DB/models/logSchema";
import { Incident } from "../DB/models/incidentSchemas";
import { getAiSuggestions } from "./AiSuggestions";
import { AiAnalysis } from "../DB/models/AiAnalysisSchema";


export async function DetectIncidents(projectId: mongoose.Types.ObjectId, service: string, environment: string, severity : string, reason: "CRITICAL_LOG" | "ERROR_SPIKE") {
    try {
        await connectDB();
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const errorLogs = await Log.find({
            projectId,
            service,
            level: "ERROR",
            timestamp: {
                $gte: oneMinuteAgo,
            }
        }).sort({ createdAt: 1 }).limit(100);
        if(errorLogs.length == 0 && reason != "CRITICAL_LOG")return ;

         const existingIncident = await Incident.findOneAndUpdate({ projectId, service, status: "OPEN" },{
                $addToSet: {
                    relatedLogs: { $each: errorLogs.map((log) => log._id) },
                },
                $set: { lastSeen: errorLogs[errorLogs.length - 1]?.createdAt ?? new Date() },
            },
            { new: true }
        );
        
        // If already existing incident that is open then return 
        if (existingIncident) {
            return ;
        };
       // Create a new Incident
       const incident = await Incident.create({
            projectId,
            service,
            title: `${service} experiencing ${reason === "CRITICAL_LOG" ? "a critical error" : "an error spike"}.`,
            serverity: severity === "CRITICAL" ? "CRITICAL" : "HIGH",
            status: "OPEN",
            relatedLogs: errorLogs.map((log) => log._id),
            firstSeen: errorLogs[0]?.createdAt ?? new Date(),
            lastSeen: errorLogs[errorLogs.length - 1]?.createdAt ?? new Date(),
        });

         getAiSuggestions(service, environment, severity, errorLogs)
         .then(async(suggestionsData)=>{
              const suggestion = await AiAnalysis.create({
                summary: suggestionsData.summary,
                    rootCause: suggestionsData.rootCause,
                    recommendation: suggestionsData.recommendation,
                    model: suggestionsData.model,
                    evidence: suggestionsData.evidence,
                    confidence: suggestionsData.confidence,
              });
              await Incident.findByIdAndUpdate(incident._id,{
                aiSuggestions: suggestion._id,
              });
         })
         .catch((err)=>console.log("Ai Suggestion generation failed: ", err));

    } catch (err) {
        console.log("Error Detecting Incidents.", err);
    }
}