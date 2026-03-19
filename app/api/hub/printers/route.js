import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

export async function GET(request) {
  console.log("🌐GET /app/api/hub/printers/route.js");
  try {
    // Get token from header
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    // Forward request to VPS server
    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/printers`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Error in /api/hub/printers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
