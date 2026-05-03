import { NextRequest, NextResponse } from "next/server";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface AlertPayload {
  type: "leve" | "grave";
  lat: number;
  lng: number;
  vehicleId: string;
  timestamp: string; // ISO 8601
}

export interface AlertResponse {
  success: boolean;
  alertId: string;
  estimatedResponse: string;
}

/* ─── POST /api/alerts ───────────────────────────────────────────────── */

export async function POST(req: NextRequest): Promise<NextResponse<AlertResponse>> {
  let body: AlertPayload;

  try {
    body = (await req.json()) as AlertPayload;
  } catch {
    return NextResponse.json(
      { success: false, alertId: "", estimatedResponse: "" },
      { status: 400 }
    );
  }

  const { type, lat, lng, vehicleId, timestamp } = body;

  // Validate required fields
  if (!type || lat == null || lng == null || !vehicleId || !timestamp) {
    return NextResponse.json(
      { success: false, alertId: "", estimatedResponse: "" },
      { status: 422 }
    );
  }

  // Log for now — replace with real dispatch service later
  console.log("[VialidadSV] Alert received:", {
    type,
    vehicleId,
    coordinates: { lat, lng },
    timestamp,
    // TODO: forward to PNC / Cruz Roja dispatch API
    // TODO: persist to database
    // TODO: notify nearby units via push
  });

  const alertId = `alrt-${Date.now()}-${vehicleId}`;
  const estimatedResponse = type === "grave" ? "8 min" : "15 min";

  return NextResponse.json(
    { success: true, alertId, estimatedResponse },
    { status: 200 }
  );
}
