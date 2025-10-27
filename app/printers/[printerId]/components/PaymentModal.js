"use client";

import { useEffect, useRef, useState } from "react";

const MIDTRANS_ENVIRONMENT = "sandbox";
const MIDTRANS_CLIENT_KEY_SANDBOX = "Mid-client-wPXTxafwqLeUkNQD";
const MIDTRANS_CLIENT_KEY_PRODUCTION = "Mid-client-S7IFqCPzEbOVyOrF";

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  paymentData,
  isLoading = false,
  userSession = null,
  isRestoredTransaction = false,
}) {
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [snapError, setSnapError] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Gunakan ref untuk tracking state yang konsisten
  const snapScriptRef = useRef(null);
  const isSnapOpenRef = useRef(false);
  const hasAttemptedOpenRef = useRef(false);

  // SUPPRESS CONSOLE ERRORS - Tangkap error global dari Snap
  useEffect(() => {
    const originalConsoleError = console.error;

    // Suppress Snap-related network errors
    console.error = (...args) => {
      const errorMessage = args[0]?.toString() || "";

      // Filter out Midtrans network errors
      if (
        errorMessage.includes("Network Error") &&
        (errorMessage.includes("snap-assets") ||
          errorMessage.includes("midtrans"))
      ) {
        console.log("🔕 Suppressed Midtrans network error (expected behavior)");
        return;
      }

      // Filter out Snap state transition errors
      if (
        errorMessage.includes(
          "snap.pay is not allowed to be called in this state"
        )
      ) {
        console.log("🔕 Suppressed Snap state error (expected behavior)");
        return;
      }

      // Untuk error lainnya, tampilkan seperti biasa
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Function untuk buka Snap payment dengan protection
  const openSnapPayment = () => {
    // Protection: cegah multiple calls
    if (isSnapOpenRef.current || !paymentData?.token || !window.snap) {
      console.log(
        "⚠️ Snap sudah terbuka atau tidak tersedia, mengabaikan panggilan"
      );
      return;
    }

    console.log("🔄 Membuka Snap payment...");
    setSnapError(false);
    isSnapOpenRef.current = true;
    hasAttemptedOpenRef.current = true;

    try {
      window.snap.pay(paymentData.token, {
        onSuccess: function (result) {
          console.log("✅ Payment success:", result);
          isSnapOpenRef.current = false;
          hasAttemptedOpenRef.current = false;
          onSuccess(result);
        },
        onPending: function (result) {
          console.log("🔄 Payment pending:", result);
          isSnapOpenRef.current = false;
          hasAttemptedOpenRef.current = false;
          onSuccess(result);
        },
        onError: function (result) {
          console.log("❌ Payment error:", result);
          isSnapOpenRef.current = false;
          hasAttemptedOpenRef.current = false;
          setSnapError(true);
        },
        onClose: function () {
          console.log("🔒 Payment modal closed by user");
          isSnapOpenRef.current = false;
          hasAttemptedOpenRef.current = false;
          // Jangan panggil onClose() otomatis, biarkan user manual close
          setSnapError(false); // Reset error state ketika user close manual
        },
      });
    } catch (error) {
      console.log("🔕 Snap opening error (non-critical):", error.message);
      isSnapOpenRef.current = false;
      hasAttemptedOpenRef.current = false;
      setSnapError(true);
    }
  };

  // Load Snap script hanya sekali
  useEffect(() => {
    if (!isOpen || !paymentData?.token) {
      // Reset state ketika modal ditutup
      isSnapOpenRef.current = false;
      hasAttemptedOpenRef.current = false;
      return;
    }

    // Reset state ketika modal dibuka
    setSnapLoaded(false);
    setSnapError(false);
    isSnapOpenRef.current = false;
    hasAttemptedOpenRef.current = false;

    console.log("🔧 Initializing Midtrans Snap...");

    // Hapus script sebelumnya jika ada
    if (
      snapScriptRef.current &&
      document.body.contains(snapScriptRef.current)
    ) {
      document.body.removeChild(snapScriptRef.current);
      snapScriptRef.current = null;
    }

    // Tentukan Snap URL berdasarkan environment
    const snapUrl =
      MIDTRANS_ENVIRONMENT === "production"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

    const clientKey =
      MIDTRANS_ENVIRONMENT === "production"
        ? MIDTRANS_CLIENT_KEY_PRODUCTION
        : MIDTRANS_CLIENT_KEY_SANDBOX;

    console.log(`🔧 Loading Midtrans Snap from: ${snapUrl}`);

    // Load Midtrans Snap script dengan error handling
    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    script.onload = () => {
      console.log("✅ Snap script loaded successfully");
      setSnapLoaded(true);

      // Auto open Snap hanya jika bukan restored transaction DAN belum pernah dicoba
      if (!isRestoredTransaction && !hasAttemptedOpenRef.current) {
        console.log("🚀 Auto-opening Snap for new transaction");
        // Beri delay untuk memastikan Snap benar-benar siap
        setTimeout(() => {
          openSnapPayment();
        }, 1000);
      }
    };

    script.onerror = (error) => {
      console.log("🔕 Snap script load error (non-critical):", error);
      setSnapError(true);
      setSnapLoaded(false);
    };

    document.body.appendChild(script);
    snapScriptRef.current = script;

    // Cleanup function - lebih gentle
    return () => {
      // Jangan hapus script terlalu agresif, biarkan Midtrans handle cleanup sendiri
      setTimeout(() => {
        if (
          snapScriptRef.current &&
          document.body.contains(snapScriptRef.current)
        ) {
          try {
            document.body.removeChild(snapScriptRef.current);
          } catch (e) {
            console.log("🔕 Cleanup error (expected):", e.message);
          }
          snapScriptRef.current = null;
        }
      }, 1000); // Beri waktu untuk Midtrans cleanup

      isSnapOpenRef.current = false;
      hasAttemptedOpenRef.current = false;
    };
  }, [isOpen, paymentData?.token]); // Hanya depend on isOpen dan token

  // Handle manual close - lebih smooth
  const handleManualClose = () => {
    console.log("👤 User manually closing payment modal");
    isSnapOpenRef.current = false;
    hasAttemptedOpenRef.current = false;

    // Beri sedikit delay sebelum benar-benar close
    setTimeout(() => {
      onClose();
    }, 100);
  };

  // Handle manual open Snap
  const handleManualOpenSnap = () => {
    if (snapLoaded && !isSnapOpenRef.current) {
      openSnapPayment();
    }
  };

  // Handle cancel transaction
  const handleCancelTransaction = async () => {
    if (!paymentData?.orderId || !userSession?.phone) {
      handleManualClose();
      return;
    }

    if (!window.confirm("Apakah Anda yakin ingin membatalkan transaksi ini?")) {
      return;
    }

    setIsCancelling(true);
    try {
      const response = await fetch("/api/transactions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: paymentData.orderId,
          phoneNumber: userSession.phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Transaction cancelled successfully");
        alert("❌ Transaksi berhasil dibatalkan");
        handleManualClose();
      } else {
        throw new Error(result.error || "Gagal membatalkan transaksi");
      }
    } catch (error) {
      console.error("❌ Error cancelling transaction:", error);
      alert("❌ Gagal membatalkan transaksi: " + error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  // Modal container
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative">
        {/* Tombol Close */}
        <button
          onClick={handleManualClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          disabled={isLoading || isCancelling}
          title="Tutup modal pembayaran"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Banner untuk Restored Transaction */}
        {/* {isRestoredTransaction && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-left">
                <p className="text-yellow-800 text-sm font-medium">
                  Melanjutkan Transaksi Tertunda
                </p>
                <p className="text-yellow-600 text-xs">
                  Transaksi ini disimpan dari sesi sebelumnya
                </p>
              </div>
            </div>
          </div>
        )} */}

        {/* Status Snap Loading */}
        {!snapLoaded && !snapError && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {isRestoredTransaction
                ? "Memuat Pembayaran..."
                : "Membuka Pembayaran..."}
            </h3>
            <p className="text-gray-600 mb-4">
              Sedang memuat halaman pembayaran Midtrans
            </p>
          </>
        )}

        {/* Error State */}
        {snapError && (
          <>
            <div className="mx-auto mb-4 text-orange-500">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Perhatian
            </h3>
            <p className="text-gray-600 mb-4">
              Terjadi masalah teknis dengan pembayaran. Silakan coba lagi.
            </p>
          </>
        )}

        {/* Success Load State - khusus untuk restored transaction */}
        {/* {snapLoaded && !snapError && isRestoredTransaction && (
          <>
            <div className="mx-auto mb-4 text-green-500">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Pembayaran Siap
            </h3>
            <p className="text-gray-600 mb-4">
              Klik tombol di bawah untuk melanjutkan pembayaran
            </p>
          </>
        )} */}

        {/* Informasi Order */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600">Order ID:</p>
          <p className="font-mono text-sm font-medium text-gray-800 break-all">
            {paymentData?.orderId}
          </p>
          <p className="text-lg font-bold text-green-600 mt-1">
            Rp {paymentData?.amount?.toLocaleString("id-ID")}
          </p>

          {isRestoredTransaction && (
            <p className="text-xs text-orange-600 mt-2">
              ⏰ Transaksi berlaku hingga 1 jam
            </p>
          )}
        </div>

        {/* Tombol Buka Snap - Tampil jika Snap sudah loaded DAN belum terbuka */}
        {snapLoaded && !snapError && !isSnapOpenRef.current && (
          <button
            onClick={handleManualOpenSnap}
            disabled={isLoading || isCancelling}
            className="w-full mb-3 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>
              {isRestoredTransaction
                ? "Lanjutkan Pembayaran"
                : "Buka Snap Pembayaran"}
            </span>
          </button>
        )}

        {/* Status Snap sedang terbuka */}
        {isSnapOpenRef.current && (
          <div className="w-full mb-3 bg-blue-100 border border-blue-300 text-blue-800 py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Pop-up pembayaran sedang terbuka...</span>
          </div>
        )}

        {/* Tombol Batalkan Transaksi */}
        {!isSnapOpenRef.current && (
          <button
            onClick={handleCancelTransaction}
            disabled={isCancelling}
            className="w-full mb-3 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:bg-gray-300 transition-colors text-sm cursor-pointer flex items-center justify-center space-x-2"
          >
            {isCancelling ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span>
              {isCancelling ? "Membatalkan..." : "Batalkan Transaksi"}
            </span>
          </button>
        )}

        {/* Status Loading File */}
        {isLoading && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-blue-800 text-sm font-medium">
                Mengirim file untuk printing...
              </p>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 mt-3 space-y-1">
          <p>• Jika pop-up tidak terbuka, pastikan pop-up tidak diblokir</p>
        </div>
      </div>
    </div>
  );
}
