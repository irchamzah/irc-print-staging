import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL;

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type");
    const url = new URL(request.url);

    console.log("📡 Received request to:", url.pathname);
    console.log("📋 Content-Type:", contentType);

    if (contentType && contentType.includes("application/json")) {
      // Handle restored transaction - forward as JSON to same endpoint
      const jsonData = await request.json();

      console.log("📤 Forwarding RESTORED transaction to VPS");
      console.log("📦 Payload:", {
        orderId: jsonData.orderId,
        printerId: jsonData.printerId,
        isRestoredTransaction: jsonData.isRestoredTransaction,
      });

      const response = await fetch(`${VPS_API_URL}/api/print`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...jsonData,
          isRestored: true, // Add flag untuk VPS
        }),
      });

      // DEBUG: Handle response properly
      console.log("📡 VPS response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ VPS error response:", errorText);
        throw new Error(
          `VPS returned ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("✅ VPS restored response:", result);

      return NextResponse.json(result);
    } else {
      // Handle normal file upload - original code
      const formData = await request.formData();

      console.log("📤 Forwarding NORMAL transaction to VPS");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${VPS_API_URL}/api/print`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `VPS returned ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("✅ VPS response:", result);

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("❌ Print API error:", error);

    let errorMessage = error.message;
    if (error.name === "AbortError") {
      errorMessage = "VPS timeout - server tidak merespons";
    } else if (error.message.includes("fetch failed")) {
      errorMessage = "Tidak dapat terhubung ke server print";
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details:
          "Pastikan VPS server sedang running dan endpoint /api/print tersedia",
      },
      { status: 500 }
    );
  }
}
