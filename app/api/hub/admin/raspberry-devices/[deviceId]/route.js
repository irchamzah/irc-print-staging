// /app/api/hub/admin/raspberry-devices/[deviceId]/route.js
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// GET /api/hub/admin/raspberry-devices/:deviceId - Get single device
export async function GET(request, { params }) {
  try {
    const { deviceId } = params;

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/raspberry-devices/${deviceId}`,
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
    console.error("❌ Error fetching raspberry device:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/hub/admin/raspberry-devices/:deviceId - Update device
export async function PUT(request, { params }) {
  try {
    const { deviceId } = params;
    const body = await request.json();

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/raspberry-devices/${deviceId}`,
      {
        method: "PUT",
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
    console.error("❌ Error updating raspberry device:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/hub/admin/raspberry-devices/:deviceId - Delete device
export async function DELETE(request, { params }) {
  try {
    const { deviceId } = params;

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/raspberry-devices/${deviceId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: request.headers.get("authorization"),
        },
      },
    );

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("❌ Error deleting raspberry device:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
