
import { connectDB } from "@/src/DB/DbConnection";
import { Log } from "@/src/DB/models/logSchema";
import { Project } from "@/src/DB/models/projectSchema";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}


export async function POST(req: NextRequest) {
    try {
        // database connection
        await connectDB();

        //Get the API Key from header
        const apiKey = req.headers.get("x-api-key");

        if (!apiKey) {
            return NextResponse.json({ success: false, message: "API Key is required", },
                { status: 401, headers: corsHeaders, });
        }

        // Rrequest body
        const { service, level, message, environment, metadata } = await req.json();

        // Data Validation
        if (!service || !level || !message) {
            return NextResponse.json({ success: false, message: "service, level and message are required.", },
                { status: 400, headers: corsHeaders, }
            );
        }

        // Validate API Key
        const project = await Project.findOne({ apiKey });

        if (!project) {
            return NextResponse.json(
                { success: false, message: "Unauthorized", },
                { status: 401, headers: corsHeaders, }
            );
        }

        // Store Log
        await Log.create({
            projectId: project._id,
            service,
            level,
            message,
            environment,
            metadata,
        });

        return NextResponse.json({ success: true, message: "Log stored successfully.", },
            { status: 201, headers: corsHeaders, }
        );
    } catch (err) {
        console.error("Log API Error:", err);

        return NextResponse.json(
            { success: false, message: err instanceof Error ? err.message : "Internal Server Error", },
            {
                status: 500,
                headers: corsHeaders,
            }
        );
    }
}