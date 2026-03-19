import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// GET /api/hub/admin/paper-refills/stats/summary - Get refill statistics
export async function GET(request) {
  console.log("🌐GET /api/hub/admin/paper-refills/stats/summary");
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/paper-refills/stats/summary`,
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
    console.error(
      "❌ Error in /api/hub/admin/paper-refills/stats/summary GET:",
      error,
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
