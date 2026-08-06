import { auth } from "@/lib/auth";
import { connectDB } from "@/src/DB/DbConnection";
import { Incident } from "@/src/DB/models/incidentSchemas";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const { status } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Incident ID is required" }, { status: 400 });
    }

    if (!status || !["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const incident = await Incident.findById(id);
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    incident.status = status;
    await incident.save();

    return NextResponse.json({
      success: true,
      data: incident,
    });
  } catch (err) {
    console.error("Incident Update Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Incident ID is required" }, { status: 400 });
    }

    const incident = await Incident.findByIdAndDelete(id);
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Incident deleted",
    });
  } catch (err) {
    console.error("Incident Delete Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
