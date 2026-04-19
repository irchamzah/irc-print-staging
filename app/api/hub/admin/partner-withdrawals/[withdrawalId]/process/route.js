import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

export async function POST(request, { params }) {
  try {
    const { withdrawalId } = await params;
    const contentType = request.headers.get("content-type") || "";
    const token = request.headers.get("authorization");

    console.log(`📤 Proxy: Processing withdrawal ${withdrawalId}`);
    console.log(`   Content-Type: ${contentType}`);

    let body;
    let headers = {
      Authorization: token,
    };

    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
      console.log(`   FormData received with file`);
    } else {
      body = JSON.stringify(await request.json());
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/partner-withdrawals/${withdrawalId}/process`,
      {
        method: "POST",
        headers,
        body,
      },
    );

    console.log(`   VPS Response status: ${response.status}`);

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("❌ Proxy error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
