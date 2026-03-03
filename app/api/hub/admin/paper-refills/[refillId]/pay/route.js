import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL || "http://103.150.90.67:3002";

// POST /api/hub/admin/paper-refills/[refillId]/pay - Mark refill as paid
export async function POST(request, { params }) {
  try {
    const { refillId } = params;
    const token = request.headers.get("authorization")?.split(" ")[1];
    const body = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${VPS_API_URL}/api/hub/admin/paper-refills/${refillId}/pay`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(
      "❌ Error in /api/hub/admin/paper-refills/[refillId]/pay POST:",
      error,
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
