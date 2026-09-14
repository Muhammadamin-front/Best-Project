import { getDb } from "../../../db";
import { reports } from "../../../db/schema";
import { reportSchema } from "../../../lib/product";
import { requireProfile } from "../../../lib/server-auth";

const priorityReasons = new Set(["self_harm", "immediate_danger"]);

export async function POST(request: Request) {
  try {
    const profile = await requireProfile(request);
    if (!profile) return Response.json({ error: "Authentication required" }, { status: 401 });
    const parsed = reportSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid report", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    const id = `rpt_${crypto.randomUUID()}`;
    await getDb().insert(reports).values({ id, reporterId: profile.id, targetType: parsed.data.targetType, targetId: parsed.data.targetId, reason: parsed.data.reason, details: parsed.data.details || null, priority: priorityReasons.has(parsed.data.reason) ? "urgent" : "normal" });
    return Response.json({ id, status: "open" }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
