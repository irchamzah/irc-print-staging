// /app/api/hub/admin/raspberry-devices/[deviceId]/assign-printers/route.js
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// POST /api/hub/admin/raspberry-devices/:deviceId/assign-printers
export async function POST(request, { params }) {
  try {
    const { deviceId } = params;
    const body = await request.json();

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/raspberry-devices/${deviceId}/assign-printers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: request.headers.get("authorization"),
        },
        body: JSON.stringify(body),
      },
    );

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("❌ Error assigning printers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET /api/hub/admin/raspberry-devices/:deviceId/printers - Get assigned printers
export async function GET(request, { params }) {
  try {
    const { deviceId } = params;

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/raspberry-devices/${deviceId}/printers`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(request.headers.get("authorization") && {
            Authorization: request.headers.get("authorization"),
          }),
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `VPS API error: ${response.status}` },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error fetching assigned printers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
