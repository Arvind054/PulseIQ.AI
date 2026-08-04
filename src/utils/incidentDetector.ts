import mongoose from "mongoose";
import { connectDB } from "../DB/DbConnection";
import { Log } from "../DB/models/logSchema";
import { Incident } from "../DB/models/incidentSchemas";


export async function DetectIncidents(projectId: mongoose.Types.ObjectId, service: string){
       
    try{
        await connectDB();
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const errorLogs = await Log.find({
            projectId,
            service,
            level:"ERROR",
            timestamp:{
                gte: oneMinuteAgo,
            }
        }).sort({createdAt: 1}).limit(100);
        
        const errorCount = errorLogs.length;
        if(errorCount < 5)return ;
        const existingIncident = await Incident.findOne({
            projectId,
            service,
            status: "OPEN",
        });

        if(existingIncident){
           existingIncident.lastSeen = new Date();
           existingIncident.relatedLogs = errorLogs.map((log=>log._id));
           await existingIncident.save();
           return ;
        };
        await Incident.create({
            projectId,
            service,
            title: `${service} experiencing error.`,
            serverity: "HIGH",
            status: "OPEN",
            relatedLogs: errorLogs.map(log=>log._id),
            firstSeen: errorLogs[0].createdAt,
            lastSeen: errorLogs[errorLogs.length - 1].createdAt,
        });

    }catch(err){
        console.log("Error Detecting Incidents.", err);
    }
}