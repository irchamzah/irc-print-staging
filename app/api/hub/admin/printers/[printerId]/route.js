import { NextResponse } from "next/server";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// export async function GET(request, { params }) {
//   console.log("🌐GET /api/hub/admin/printers/[printerId]");
//   try {
//     const { printerId } = await params;
//     const token = request.headers.get("authorization")?.split(" ")[1];

//     if (!token) {
//       return NextResponse.json(
//         { success: false, error: "No token provided" },
//         { status: 401 },
//       );
//     }

//     const response = await fetch(
//       `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/printers/${printerId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       },
//     );

//     const data = await response.json();
//     return NextResponse.json(data, { status: response.status });
//   } catch (error) {
//     console.error(
//       "❌ Error in /api/hub/admin/printers/[printerId] GET:",
//       error,
//     );
//     return NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }

// 🌐PUT /api/hub/admin/printers/[printerId] - Update printer TERPAKAI
export async function PUT(request, { params }) {
  try {
    const { printerId } = await params;
    const token = request.headers.get("authorization")?.split(" ")[1];
    const body = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/printers/${printerId}`,
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
    console.error(
      "❌ Error in /api/hub/admin/printers/[printerId] PUT:",
      error,
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 🌐 DELETE /api/hub/admin/printers/[printerId] - Delete printer TERPAKAI
export async function DELETE(request, { params }) {
  try {
    const { printerId } = await params;
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${NEXT_PUBLIC_VPS_API_URL}/api/hub/admin/printers/${printerId}`,
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
    console.error(
      "❌ Error in /api/hub/admin/printers/[printerId] DELETE:",
      error,
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
