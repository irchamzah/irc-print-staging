import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// POST /api/hub/admin/partner-withdrawals/:withdrawalId/process
export async function POST(request, { params }) {
  try {
    const { withdrawalId } = await params;
    const body = await request.json();

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/partner-withdrawals/${withdrawalId}/process`,
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
    console.error("❌ Error processing withdrawal:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
