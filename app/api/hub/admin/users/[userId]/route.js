// app/api/hub/admin/users/[userId]/route.js
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// GET /api/hub/admin/users/[userId] - Get single user
export async function GET(request, { params }) {
  console.log("🌐GET /api/hub/admin/users/[userId]");
  try {
    const { userId } = params;
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/users/${userId}`,
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
    console.error("❌ Error in /api/hub/admin/users/[userId] GET:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/hub/admin/users/[userId] - Update user
export async function PUT(request, { params }) {
  console.log("🌐PUT /api/hub/admin/users/[userId]");
  try {
    const { userId } = params;
    const token = request.headers.get("authorization")?.split(" ")[1];
    const body = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/users/${userId}`,
      {
        method: "PUT",
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
    console.error("❌ Error in /api/hub/admin/users/[userId] PUT:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/hub/admin/users/[userId] - Delete user
export async function DELETE(request, { params }) {
  console.log("🌐DELETE /api/hub/admin/users/[userId]");
  try {
    const { userId } = params;
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Error in /api/hub/admin/users/[userId] DELETE:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
