import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// 🌐GET /api/hub/admin/paper-refills - Get all refills TERPAKAI
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const status = searchParams.get("status") || "";

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    let url = `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/paper-refills?limit=${limit}`;
    if (status) url += `&status=${status}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Error in /api/hub/admin/paper-refills GET:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
