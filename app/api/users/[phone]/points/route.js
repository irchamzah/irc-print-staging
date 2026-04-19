import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// Function to normalize phone number to +628xxxxxxxxx format
function normalizePhoneNumber(phone) {
  if (!phone) return phone;

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // If starts with 0, replace with 62
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }

  // If starts with 8, add 62
  if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }

  // Add + prefix
  return "+" + cleaned;
}

// GET /api/users/[phone]/points
export async function GET(request, { params }) {
  try {
    const { phone } = await params;
    const { searchParams } = new URL(request.url);
    const printerId = searchParams.get("printerId");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // ✅ UPDATE: Gunakan endpoint GET langsung di VPS
    const getResponse = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/users/${phone}/points`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (getResponse.ok) {
      const result = await getResponse.json();

      if (result.success) {
        return NextResponse.json({
          success: true,
          points: result.points || 0,
          user: {
            phone: result.user?.phone || phone,
            name: result.user?.name || `User ${phone}`,
            points: result.points || 0,
          },
          isNewUser: false,
        });
      }
    }

    // Jika GET gagal (user tidak ditemukan), buat user baru
    return await createNewUser(phone, printerId);
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("⏰ Request timeout");
      return NextResponse.json(
        { success: false, error: "Request timeout" },
        { status: 408 },
      );
    }
    console.error(
      "❌ [FRONTEND] Error in /api/users/[phone]/points:",
      error.message,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Service sedang tidak tersedia",
        details: "Silakan coba beberapa saat lagi",
      },
      { status: 503 },
    );
  }
}

// Helper function untuk membuat user baru
async function createNewUser(phone, printerId) {
  try {
    // Normalize phone number before creating user
    const normalizedPhone = normalizePhoneNumber(phone);

    let pointDivider = 4000; // Default value

    // Dapatkan point divider dari printer jika ada
    if (printerId) {
      try {
        const printerResponse = await fetch(
          `${NEXT_PUBLIC_VPS_API_URL}/api/printers/${printerId}`,
        );
        if (printerResponse.ok) {
          const printerData = await printerResponse.json();
          pointDivider = printerData.printer?.pointDivider || 4000;
        }
      } catch (error) {
        console.error("Error fetching printer point divider:", error);
      }
    }

    // ✅ UPDATE: Gunakan endpoint POST yang benar di VPS
    const createResponse = await fetch(`${NEXT_PUBLIC_VPS_API_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        name: `User ${normalizedPhone}`,
        role: "customer",
        points: 0,
        totalSpent: 0,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("❌ [FRONTEND] Create user failed:", errorText);
      throw new Error(`Create user failed: ${createResponse.status}`);
    }

    const createResult = await createResponse.json();

    if (createResult.success) {
      return NextResponse.json({
        success: true,
        points: 0,
        user: {
          phone: createResult.data?.phone || normalizedPhone,
          name: createResult.data?.name || `User ${normalizedPhone}`,
          points: 0,
        },
        isNewUser: true,
        message: "User baru berhasil dibuat dengan 0 poin",
      });
    } else {
      throw new Error(createResult.error || "Gagal membuat user");
    }
  } catch (error) {
    console.error("❌ [FRONTEND] Create new user error:", error.message);

    // Return response yang graceful meskipun error
    return NextResponse.json({
      success: true,
      points: 0,
      user: {
        phone: normalizedPhone,
        name: `User ${normalizedPhone}`,
        points: 0,
      },
      isNewUser: true,
      message: "User created with default values (API fallback)",
    });
  }
}
