import { auth } from "@/lib/auth";
import { connectDB } from "@/src/DB/DbConnection";
import { AiAnalysis } from "@/src/DB/models/AiAnalysisSchema";
import { Log } from "@/src/DB/models/logSchema";
import { Incident } from "@/src/DB/models/incidentSchemas";
import { Project } from "@/src/DB/models/projectSchema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: "ProjectId is required" }, { status: 400 });
    }

    // Verify ownership
    const project = await Project.findOne({ _id: projectId, ownerId: session.user.id });
    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    // Define simulation log templates
    const now = new Date();
    const logData = [
      {
        projectId,
        service: "api-gateway",
        level: "INFO",
        message: "Incoming POST /checkout request from IP 192.168.1.42",
        environment: "production",
        timestamp: new Date(now.getTime() - 50 * 1000),
        metadata: { path: "/checkout", method: "POST", version: "v2.1" },
      },
      {
        projectId,
        service: "order-service",
        level: "INFO",
        message: "Processing checkout request for order_id 94f8da1",
        environment: "production",
        timestamp: new Date(now.getTime() - 40 * 1000),
        metadata: { orderId: "94f8da1", cartSize: 3, userId: "usr_94f4a2" },
      },
      {
        projectId,
        service: "auth-service",
        level: "ERROR",
        message: "PostgreSQL connection pool exhausted. Active connections: 20 (max: 20). Waiting queue length: 50. Timeout in 10000ms.",
        environment: "production",
        timestamp: new Date(now.getTime() - 30 * 1000),
        metadata: {
          active_connections: 20,
          max_connections: 20,
          wait_queue: 50,
          driver: "node-postgres",
        },
      },
      {
        projectId,
        service: "user-db",
        level: "ERROR",
        message: "Fatal query timeout: SELECT * FROM users WHERE id = 'usr_94f4a2'. Connection closed by peer.",
        environment: "production",
        timestamp: new Date(now.getTime() - 25 * 1000),
        metadata: { query: "SELECT * FROM users WHERE id = $1", duration_ms: 10008 },
      },
      {
        projectId,
        service: "payment-api",
        level: "ERROR",
        message: "Failed to process checkout: payment authorization failed due to user-service connection timeout.",
        environment: "production",
        timestamp: new Date(now.getTime() - 20 * 1000),
        metadata: { status_code: 504, request_id: "tx-691ad21" },
      },
      {
        projectId,
        service: "notification",
        level: "WARN",
        message: "Delayed checkout notification for order_id 94f8da1: payload delivery took 5200ms.",
        environment: "production",
        timestamp: new Date(now.getTime() - 15 * 1000),
        metadata: { transport: "sqs", duration_ms: 5202 },
      },
    ];

    // Bulk insert logs
    const createdLogs = await Log.insertMany(logData);
    const logIds = createdLogs.map((l) => l._id);

    const aiAnalysis = await AiAnalysis.create({
      summary:
        "A sudden surge in concurrent checkout traffic triggered database connection pool saturation on auth-service, which cascaded into authentication timeouts and downstream checkout failures.",
      rootCause:
        "The database client connection pool on auth-service was capped at 20. Concurrent transactional load occupied all available connections and pushed request wait times beyond the timeout threshold.",
      recommendation:
        "1. Increase the auth-service database pool size.\n2. Add a circuit breaker or fallback for elevated auth latency.\n3. Deploy PgBouncer or a similar connection pooler in front of PostgreSQL.",
      model: "gemini-2.5-flash",
      evidence:
        "PostgreSQL connection pool exhausted. Active connections: 20 (max: 20). Waiting queue length: 50. Timeout in 10000ms.",
      confidence: 94,
    });

    // Create a matching incident representing the root cause and suggestions
    const incident = await Incident.create({
      projectId,
      title: "Auth DB Connection Pool Exhaustion Cascade",
      serverity: "CRITICAL",  // matching layout 'CRITICAL' in schema
      status: "OPEN",
      summary: "A sudden surge in concurrent checkout traffic triggered database connection pool saturation on auth-service. This caused user authentication queries to time out, which cascaded to checkout failures on payment-api and degraded delivery times in the notification service.",
      rootCause: "Database client connection pool on auth-service was capped at 20. Concurrent transactional load occupied all connections, leaving downstream service queries waiting in queue until gateway timeout threshold was crossed.",
      aiSuggestions: aiAnalysis._id,
      relatedLogs: logIds,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Sample cascade logs and incident diagnostics simulated.",
      incidentId: incident._id,
      logsCount: createdLogs.length,
    });
  } catch (err) {
    console.error("Simulation API Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
