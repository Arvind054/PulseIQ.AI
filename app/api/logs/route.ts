
import { auth } from "@/lib/auth";
import { connectDB } from "@/src/DB/DbConnection";
import { Log } from "@/src/DB/models/logSchema";
import { Project } from "@/src/DB/models/projectSchema";
import { headers } from "next/headers";
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

export async function GET(req: NextRequest) {
    try { 
         const session = await auth.api.getSession({ headers: await headers()});
                   if(!session?.user?.id){
                    return NextResponse.json({error: "Unauthorized"}, {status: 401});
                   }
        await connectDB();

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId")?.trim();
        const page = Number.parseInt(searchParams.get("page") || "1", 10);
        const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
        const level = searchParams.get("level")?.toUpperCase() || undefined;
        const service = searchParams.get("service")?.trim() || undefined;
        const environment = searchParams.get("environment")?.trim().toLowerCase() || undefined;
        const search = searchParams.get("search")?.trim() || undefined;

        if (!projectId) {
            return NextResponse.json(
                { success: false, message: "projectId is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        const safePage = Number.isFinite(page) && page > 0 ? page : 1;
        const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20;

        const filters: Record<string, unknown> = {
            projectId,
        };

        if (level) filters.level = level;
        if (service) filters.service = { $regex: service, $options: "i" };
        if (environment) filters.environment = environment;
        if (search) {
            filters.$or = [
                { message: { $regex: search, $options: "i" } },
                { service: { $regex: search, $options: "i" } },
            ];
        }

        const total = await Log.countDocuments(filters);
        const logs = await Log.find(filters)
            .sort({ timestamp: -1, createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit)
            .lean();

        return NextResponse.json(
            {
                success: true,
                data: logs,
                pagination: {
                    page: safePage,
                    limit: safeLimit,
                    total,
                    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
                    hasNextPage: safePage * safeLimit < total,
                    hasPreviousPage: safePage > 1,
                },
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (err) {
        console.error("Log Fetch Error:", err);
        return NextResponse.json(
            { success: false, message: err instanceof Error ? err.message : "Internal Server Error" },
            { status: 500, headers: corsHeaders }
        );
    }
}