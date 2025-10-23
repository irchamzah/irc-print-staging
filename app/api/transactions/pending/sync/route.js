import { NextResponse } from "next/server";

const VPS_API_URL = process.env.VPS_API_URL;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    console.log(`🔄 Syncing pending transactions for: ${phoneNumber}`);

    // 1. Ambil pending transactions dari VPS
    const pendingResponse = await fetch(
      `${VPS_API_URL}/api/transactions/pending?phoneNumber=${phoneNumber}`
    );

    if (!pendingResponse.ok) {
      throw new Error("Failed to fetch pending transactions from VPS");
    }

    const pendingResult = await pendingResponse.json();

    if (!pendingResult.success || !pendingResult.pendingTransactions) {
      return NextResponse.json({
        success: true,
        pendingTransactions: [],
        updatedTransactions: [],
      });
    }

    const pendingTransactions = pendingResult.pendingTransactions;
    const updatedTransactions = [];

    console.log(
      `📦 Found ${pendingTransactions.length} pending transactions to sync`
    );

    // 2. Untuk setiap pending transaction, cek status di Midtrans
    for (const transaction of pendingTransactions) {
      try {
        console.log(`🔍 Checking Midtrans status for: ${transaction.orderId}`);

        const statusResponse = await fetch(
          `${process.env.NEXTAUTH_URL || ""}/api/payment/status?orderId=${
            transaction.orderId
          }`
        );

        if (statusResponse.ok) {
          const statusResult = await statusResponse.json();

          if (statusResult.success) {
            const midtransStatus = statusResult.status;
            const currentStatus = transaction.status;

            console.log(
              `📊 Transaction ${transaction.orderId}: VPS=${currentStatus}, Midtrans=${midtransStatus}`
            );

            // Jika status di Midtrans berbeda dengan di VPS, update di VPS
            if (
              midtransStatus === "settlement" &&
              currentStatus === "pending"
            ) {
              console.log(
                `🔄 Updating transaction ${transaction.orderId} to settlement`
              );

              // Update status di VPS
              const updateResponse = await fetch(
                `${VPS_API_URL}/api/transactions/update-status`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId: transaction.orderId,
                    phoneNumber: phoneNumber,
                    status: "settlement",
                    midtransStatus: midtransStatus,
                  }),
                }
              );

              if (updateResponse.ok) {
                const updateResult = await updateResponse.json();
                if (updateResult.success) {
                  updatedTransactions.push({
                    orderId: transaction.orderId,
                    oldStatus: currentStatus,
                    newStatus: "settlement",
                  });
                }
              }
            } else if (
              midtransStatus === "expire" &&
              currentStatus === "pending"
            ) {
              console.log(
                `🔄 Updating transaction ${transaction.orderId} to expired`
              );

              // Update status expired di VPS
              const updateResponse = await fetch(
                `${VPS_API_URL}/api/transactions/update-status`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId: transaction.orderId,
                    phoneNumber: phoneNumber,
                    status: "expired",
                    midtransStatus: midtransStatus,
                  }),
                }
              );

              if (updateResponse.ok) {
                const updateResult = await updateResponse.json();
                if (updateResult.success) {
                  updatedTransactions.push({
                    orderId: transaction.orderId,
                    oldStatus: currentStatus,
                    newStatus: "expired",
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(
          `❌ Error checking Midtrans for ${transaction.orderId}:`,
          error.message
        );
        // Continue dengan transaction berikutnya
      }
    }

    // 3. Ambil ulang data terbaru dari VPS setelah update
    const finalResponse = await fetch(
      `${VPS_API_URL}/api/transactions/pending?phoneNumber=${phoneNumber}`
    );

    const finalResult = await finalResponse.json();

    return NextResponse.json({
      success: true,
      pendingTransactions: finalResult.pendingTransactions || [],
      updatedTransactions: updatedTransactions,
      syncSummary: {
        checked: pendingTransactions.length,
        updated: updatedTransactions.length,
      },
    });
  } catch (error) {
    console.error("❌ Error syncing pending transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        pendingTransactions: [],
      },
      { status: 500 }
    );
  }
}
