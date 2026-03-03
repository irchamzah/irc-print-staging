// app/hub/admin/paper-refills/page.js
"use client";
import { useState, useEffect } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { useAdminData } from "../hooks/useAdminData";

export default function AdminPaperRefillsPage() {
  const { isSuperAdmin } = useHubAuth();
  const {
    refills,
    refillStats,
    markRefillAsPaid,
    loading,
    error,
    refreshData,
    formatDate,
  } = useAdminData();
  const [processingId, setProcessingId] = useState(null);

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleMarkAsPaid = async (refill) => {
    if (
      !confirm(
        `Tandai pembayaran untuk ${refill.filledByName} sebesar ${formatRupiah(refill.partnerProfit)}?`,
      )
    ) {
      return;
    }

    setProcessingId(refill.refillId);
    const result = await markRefillAsPaid(refill.refillId);
    setProcessingId(null);

    if (result.success) {
      alert("✅ Pembayaran berhasil ditandai");
    } else {
      alert("❌ Gagal: " + (result.error || "Unknown error"));
    }
  };

  const handleRetry = () => {
    refreshData();
  };

  const tabs = [
    { id: "users", label: "👥 Users", href: "/hub/admin/users" },
    { id: "printers", label: "🖨️ Printers", href: "/hub/admin/printers" },
    {
      id: "refills",
      label: "💰 Paper Refills",
      href: "/hub/admin/paper-refills",
    },
  ];

  if (!isSuperAdmin()) {
    return null;
  }

  // Error state with retry button
  if (error) {
    return (
      <AdminLayout tabs={tabs} activeTab="refills">
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Gagal Memuat Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout tabs={tabs} activeTab="refills">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Profit Partner</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatRupiah(refillStats.total?.totalProfit || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {refillStats.total?.totalRefills || 0} transaksi
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Pending Payment</p>
          <p className="text-2xl font-bold text-yellow-600">
            {formatRupiah(refillStats.pending?.amount || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {refillStats.pending?.count || 0} menunggu
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Dibayar</p>
          <p className="text-2xl font-bold text-green-600">
            {formatRupiah(refillStats.paid?.amount || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {refillStats.paid?.count || 0} transaksi
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            💰 Pembayaran Partner
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola pembayaran profit partner dari pengisian kertas
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Printer
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Partner
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kertas
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Profit
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {refills.map((refill) => (
                  <tr key={refill.refillId} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">
                      {formatDate(refill.createdAt)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm font-medium text-gray-800">
                      {refill.printerName}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">
                      {refill.filledByName}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">
                      {refill.sheetsAdded} lembar
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm font-medium text-green-600">
                      {formatRupiah(refill.partnerProfit)}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {refill.status === "paid" ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Dibayar
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {refill.status !== "paid" && (
                          <button
                            onClick={() => handleMarkAsPaid(refill)}
                            disabled={processingId === refill.refillId}
                            className={`px-3 py-1 text-white rounded-lg text-xs ${
                              processingId === refill.refillId
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {processingId === refill.refillId ? (
                              <div className="flex items-center gap-1">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                <span>Memproses...</span>
                              </div>
                            ) : (
                              "Tandai Dibayar"
                            )}
                          </button>
                        )}
                        {refill.status === "paid" && refill.paidAt && (
                          <span className="text-xs text-gray-400">
                            {formatDate(refill.paidAt)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && refills.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500">Belum ada data pengisian kertas</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
