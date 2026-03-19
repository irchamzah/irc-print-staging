// app/api/hub/admin/paper-refills/[refillId]/pay/route.js
import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

export async function POST(request, { params }) {
  console.log("🌐POST /api/hub/admin/paper-refills/[refillId]/pay");
  try {
    const { refillId } = params;
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    // ✅ AMBIL FormData, bukan json()
    const formData = await request.formData();

    // Buat FormData baru untuk dikirim ke VPS
    const vpsFormData = new FormData();

    // Salin semua field dari formData asli
    for (const [key, value] of formData.entries()) {
      vpsFormData.append(key, value);
    }

    // Kirim ke VPS dengan FormData
    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/paper-refills/${refillId}/pay`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // JANGAN set Content-Type, biarkan browser set dengan boundary
        },
        body: vpsFormData, // ✅ Kirim FormData, bukan JSON
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
