import mongoose from "mongoose";
import { connectDB } from "../DB/DbConnection";
import { Log } from "../DB/models/logSchema";
import { Incident } from "../DB/models/incidentSchemas";
import { getAiSuggestions } from "./AiSuggestions";
import { AiAnalysis } from "../DB/models/AiAnalysisSchema";


export async function DetectIncidents(projectId: mongoose.Types.ObjectId, service: string, environment: string, severity : string) {
     console.log("System Fault. ✅✅✅✅✅");
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

        const errorCount = errorLogs.length;
        if (errorCount < 5 && severity != "CRITICAL") return;
        if (errorCount === 0) return;
        
        const existingIncident = await Incident.findOne({
            projectId,
            service,
            status: "OPEN",
        });
        
        if (existingIncident) {
            await Incident.findByIdAndUpdate(existingIncident._id, {
                $addToSet: {
                    relatedLogs: {
                        $each: errorLogs.map(log => log._id)
                    }
                }
            });
            return ;
        };
        console.log("Creating Incident✅✅✅");
        const suggestionsData = await getAiSuggestions(service, environment, severity, errorLogs);
       const suggestion = await AiAnalysis.create({
        summary: suggestionsData.summary,
        rootCause: suggestionsData.rootCause,
        recommendation: suggestionsData.recommendation,
        model:suggestionsData.model ,
        evidence: suggestionsData.evidence,
        confidence: suggestionsData.confidence,
    })
       const incident =  await Incident.create({
            projectId,
            service,
            title: `${service} experiencing error.`,
            serverity: "HIGH",
            status: "OPEN",
            relatedLogs: errorLogs.map(log => log._id),
            firstSeen: errorLogs[0]?.createdAt,
            lastSeen: errorLogs[errorLogs.length - 1]?.createdAt,
            aiSuggestions:suggestion._id,
        });

    } catch (err) {
        console.log("Error Detecting Incidents.", err);
    }
}