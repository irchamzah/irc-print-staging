"use client";
import { useEffect, useState } from "react";

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  paymentData,
  isLoading = false,
}) {
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [snapError, setSnapError] = useState(false);

  const openSnapPayment = () => {
    if (!paymentData?.token || !window.snap) {
      setSnapError(true);
      return;
    }

    setSnapError(false);

    // @ts-ignore
    window.snap.pay(paymentData.token, {
      onSuccess: function (result) {
        console.log("Payment success:", result);
        onSuccess();
      },
      onPending: function (result) {
        console.log("Payment pending:", result);
      },
      onError: function (result) {
        console.log("Payment error:", result);
      },
      onClose: function () {
        console.log("Payment modal closed");
      },
    });
  };

  useEffect(() => {
    if (!isOpen || !paymentData?.token) return;

    // Reset state
    setSnapLoaded(false);
    setSnapError(false);

    // Load Midtrans Snap script
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    );

    script.onload = () => {
      console.log("Snap script loaded successfully");
      setSnapLoaded(true);
      // Auto open Snap setelah script loaded
      openSnapPayment();
    };

    script.onerror = () => {
      console.error("Failed to load Snap script");
      setSnapError(true);
      setSnapLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isOpen, paymentData?.token]);

  // Modal container untuk loading state saja
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          disabled={isLoading}
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

        {/* Status Snap Loading */}
        {!snapLoaded && !snapError && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Membuka Pembayaran...
            </h3>
            <p className="text-gray-600 mb-4">
              Sedang memuat halaman pembayaran Midtrans
            </p>
          </>
        )}

        {/* Error State */}
        {snapError && (
          <>
            <div className="mx-auto mb-4 text-red-500">
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
              Gagal Memuat Pembayaran
            </h3>
            <p className="text-gray-600 mb-4">
              Pop-up pembayaran mungkin diblokir browser Anda
            </p>
          </>
        )}

        {/* Success Load State */}
        {snapLoaded && !snapError && (
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
            <p className="text-gray-600 mb-4"></p>
          </>
        )}

        {/* Informasi Order */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600">Order ID:</p>
          <p className="font-mono text-sm font-medium text-gray-800 break-all">
            {paymentData?.orderId}
          </p>
          <p className="text-lg font-bold text-green-600 mt-1">
            Rp {paymentData?.amount?.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Tombol Buka Snap Lagi - Tampil jika Snap sudah loaded */}
        {snapLoaded && !snapError && (
          <button
            onClick={openSnapPayment}
            disabled={isLoading}
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
            <span>Buka Snap Pembayaran</span>
          </button>
        )}

        {/* Tombol Coba Lagi - Tampil jika error */}
        {snapError && (
          <button
            onClick={() => window.location.reload()}
            disabled={isLoading}
            className="w-full mb-3 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:bg-orange-300 transition-colors font-medium cursor-pointer flex items-center justify-center space-x-2"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Coba Muat Ulang</span>
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

        {/* Tombol Cancel */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="w-full mt-3 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:bg-gray-300 transition-colors font-medium cursor-pointer flex items-center justify-center space-x-2"
        >
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
          <span>Batalkan Pembayaran</span>
        </button>

        {/* Help Text */}
        <div className="text-xs text-gray-500 mt-3 space-y-1">
          <p>• Jika pop-up tidak terbuka, pastikan pop-up tidak diblokir</p>
          {/* <p>• Klik &quot;Buka Snap Pembayaran&quot; untuk membuka manual</p> */}
          <p>• Refresh halaman jika mengalami masalah</p>
        </div>
      </div>
    </div>
  );
}
