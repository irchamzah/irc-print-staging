import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL;

export async function GET(request, { params }) {
  try {
    const { printerId } = params;
    const token = request.headers.get("authorization")?.split(" ")[1];
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    // Fetch dari VPS API
    const response = await fetch(`${VPS_API_URL}/api/print/jobs`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`VPS API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter jobs untuk printer ini
    if (data.success) {
      const printerJobs = data.jobs.filter(
        (job) => job.printerId === printerId,
      );
      return NextResponse.json({
        success: true,
        data: printerJobs.slice(0, parseInt(limit)),
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error in /api/hub/printers/[printerId]/jobs:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
