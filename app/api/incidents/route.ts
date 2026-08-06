import { auth } from "@/lib/auth";
import { connectDB } from "@/src/DB/DbConnection";
import { Incident } from "@/src/DB/models/incidentSchemas";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
// Get Incidents by Project.
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId")?.trim();

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const incidents = await Incident.find({ projectId })
      .sort({ createdAt: -1 })
      .populate("aiSuggestions")
      .populate("relatedLogs")
      .lean();

    return NextResponse.json({
      success: true,
      data: incidents,
    });
  } catch (err) {
    console.error("Incident Fetch Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
