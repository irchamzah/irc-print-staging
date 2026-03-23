"use client";
import { useState, useRef, useEffect } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { useAdminPaperRefills } from "../hooks/useAdminPaperRefills";
import { ProofUploadModal } from "../components/ProofUploadModal";
import CustomLink from "@/app/components/CustomLink";

// Stats Cards Component
const StatsCards = ({ stats, loading }) => {
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num || 0);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
        <p className="text-xs text-blue-600 mb-1">Total Refill</p>
        <p className="text-2xl font-bold text-blue-800">
          {formatNumber(stats.total?.totalRefills || 0)}
        </p>
        <p className="text-xs text-blue-500 mt-1">
          {formatNumber(stats.total?.totalSheets || 0)} lembar
        </p>
      </div>
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 p-4">
        <p className="text-xs text-green-600 mb-1">Total Revenue</p>
        <p className="text-2xl font-bold text-green-800">
          {formatRupiah(stats.total?.totalRevenue || 0)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-4">
        <p className="text-xs text-purple-600 mb-1">Total Profit Partner</p>
        <p className="text-2xl font-bold text-purple-800">
          {formatRupiah(stats.total?.totalProfit || 0)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-4">
        <p className="text-xs text-orange-600 mb-1">Profit Owner</p>
        <p className="text-2xl font-bold text-orange-800">
          {formatRupiah(
            (stats.total?.totalRevenue || 0) - (stats.total?.totalProfit || 0),
          )}
        </p>
      </div>
    </div>
  );
};

// Status Stats Cards
const StatusStatsCards = ({ stats, loading }) => {
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num || 0);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-yellow-600 font-medium">Aktif</p>
          <span className="text-xs text-yellow-500">
            {formatNumber(stats.pending?.count || 0)} transaksi
          </span>
        </div>
        <p className="text-xl font-bold text-yellow-700">
          {formatRupiah(stats.pending?.amount || 0)}
        </p>
        <p className="text-xs text-yellow-500 mt-1">Menunggu selesai</p>
      </div>
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-blue-600 font-medium">Selesai</p>
          <span className="text-xs text-blue-500">
            {formatNumber(stats.completed?.count || 0)} transaksi
          </span>
        </div>
        <p className="text-xl font-bold text-blue-700">
          {formatRupiah(stats.completed?.amount || 0)}
        </p>
        <p className="text-xs text-blue-500 mt-1">Menunggu pembayaran</p>
      </div>
      <div className="bg-green-50 rounded-xl border border-green-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-green-600 font-medium">Dibayar</p>
          <span className="text-xs text-green-500">
            {formatNumber(stats.paid?.count || 0)} transaksi
          </span>
        </div>
        <p className="text-xl font-bold text-green-700">
          {formatRupiah(stats.paid?.amount || 0)}
        </p>
        <p className="text-xs text-green-500 mt-1">Sudah dibayar</p>
      </div>
    </div>
  );
};

// Advanced Filter Component
const FilterSection = ({ filters, onApply, onReset, options, isLoading }) => {
  const [local, setLocal] = useState(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "active", label: "Aktif" },
    { value: "completed", label: "Selesai" },
    { value: "paid", label: "Dibayar" },
  ];

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6 border border-purple-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filter Refill
        </h4>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
        >
          {showAdvanced ? "Sembunyikan" : "Tampilkan"} Filter Lanjutan
          <svg
            className={`w-3 h-3 transform transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Status
          </label>
          <select
            value={local.status}
            onChange={(e) => setLocal({ ...local, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Printer */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Printer
          </label>
          <select
            value={local.printerId}
            onChange={(e) => setLocal({ ...local, printerId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Semua Printer</option>
            {options.printers?.map((printer) => (
              <option key={printer} value={printer}>
                {/* {console.log("🚀 ~ printer:", options)} */}
                {printer}
              </option>
            ))}
          </select>
        </div>

        {/* Partner */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Partner
          </label>
          <select
            value={local.partnerName}
            onChange={(e) =>
              setLocal({ ...local, partnerName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Semua Partner</option>
            {options.partners?.map((partner) => (
              <option key={partner} value={partner}>
                {partner}
              </option>
            ))}
          </select>
        </div>

        {/* Refill Date */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Tanggal Refill
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={local.startDate}
              onChange={(e) =>
                setLocal({ ...local, startDate: e.target.value })
              }
              className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Dari"
            />
            <input
              type="date"
              value={local.endDate}
              onChange={(e) => setLocal({ ...local, endDate: e.target.value })}
              className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Sampai"
            />
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Completed Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">
                Tanggal Selesai
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={local.startCompletedDate}
                  onChange={(e) =>
                    setLocal({ ...local, startCompletedDate: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Dari"
                />
                <input
                  type="date"
                  value={local.endCompletedDate}
                  onChange={(e) =>
                    setLocal({ ...local, endCompletedDate: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Sampai"
                />
              </div>
            </div>

            {/* Paid Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">
                Tanggal Dibayar
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={local.startPaidDate}
                  onChange={(e) =>
                    setLocal({ ...local, startPaidDate: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Dari"
                />
                <input
                  type="date"
                  value={local.endPaidDate}
                  onChange={(e) =>
                    setLocal({ ...local, endPaidDate: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Sampai"
                />
              </div>
            </div>

            {/* Profit Range */}
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">
                Profit Partner (Rp)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={local.minProfit}
                  onChange={(e) =>
                    setLocal({ ...local, minProfit: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={local.maxProfit}
                  onChange={(e) =>
                    setLocal({ ...local, maxProfit: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Sheets Range */}
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">
                Jumlah Kertas
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={local.minSheets}
                  onChange={(e) =>
                    setLocal({ ...local, minSheets: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={local.maxSheets}
                  onChange={(e) =>
                    setLocal({ ...local, maxSheets: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => onReset()}
          disabled={isLoading}
          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
        >
          Reset Filter
        </button>
        <button
          onClick={() => onApply(local)}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? "Memproses..." : "Terapkan Filter"}
        </button>
      </div>
    </div>
  );
};

// Sort Component
const SortSection = ({ currentSort, onSortChange }) => {
  const sortOptions = [
    { value: "createdAt", label: "Tanggal Refill" },
    { value: "completedAt", label: "Tanggal Selesai" },
    { value: "paidAt", label: "Tanggal Dibayar" },
    { value: "printerName", label: "Nama Printer" },
    { value: "filledByName", label: "Partner" },
    { value: "sheetsAdded", label: "Jumlah Kertas" },
    { value: "partnerProfit", label: "Profit Partner" },
    { value: "totalRevenue", label: "Total Revenue" },
  ];

  const handleSortChange = (sortBy) => {
    const newOrder =
      currentSort.sortBy === sortBy && currentSort.sortOrder === "desc"
        ? "asc"
        : "desc";
    onSortChange(sortBy, newOrder);
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
      <span className="text-sm text-gray-500">Urutkan:</span>
      <div className="flex flex-wrap gap-1">
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSortChange(opt.value)}
            className={`px-2 py-1 rounded-lg text-xs transition-colors ${
              currentSort.sortBy === opt.value
                ? "bg-purple-100 text-purple-700 font-medium"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
            {currentSort.sortBy === opt.value && (
              <span className="ml-1">
                {currentSort.sortOrder === "desc" ? "↓" : "↑"}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Table Component
const RefillsTable = ({
  refills,
  onMarkAsPaid,
  onViewProof,
  processingId,
  formatDate,
  formatRupiah,
}) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: "Aktif", className: "bg-yellow-100 text-yellow-700" },
      completed: { label: "Selesai", className: "bg-blue-100 text-blue-700" },
      paid: { label: "Dibayar", className: "bg-green-100 text-green-700" },
    };
    const s = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${s.className}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tanggal Refill
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Printer
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Partner
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Kertas
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Profit Partner
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Bukti
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {refills.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-8 text-gray-500">
                Tidak ada data refill
              </td>
            </tr>
          ) : (
            refills.map((refill) => (
              <tr key={refill.refillId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(refill.createdAt)}
                  {refill.completedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Selesai: {formatDate(refill.completedAt)}
                    </p>
                  )}
                  {refill.paidAt && (
                    <p className="text-xs text-green-600 mt-1">
                      Dibayar: {formatDate(refill.paidAt)}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  <CustomLink
                    href={`/hub/printers/${refill.printerId}`}
                    className="text-blue-500 hover:underline"
                  >
                    {refill.printerName}
                  </CustomLink>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {refill.filledByName}
                  <p className="text-xs text-gray-400">{refill.filledByRole}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {refill.sheetsAdded} lembar
                  <p className="text-xs text-gray-400">
                    {refill.paperCountBefore} → {refill.paperCountAfter}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">
                  {formatRupiah(refill.partnerProfit)}
                  <p className="text-xs text-gray-400">
                    {refill.profitShare}% dari{" "}
                    {formatRupiah(refill.totalRevenue)}
                  </p>
                </td>
                <td className="px-4 py-3">{getStatusBadge(refill.status)}</td>
                <td className="px-4 py-3">
                  {refill.transferProof ? (
                    <button
                      onClick={() => onViewProof(refill)}
                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      title="Lihat Bukti"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Lihat
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {refill.status === "completed" && (
                    <button
                      onClick={() => onMarkAsPaid(refill)}
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
                  {refill.status === "paid" && refill.paidByName && (
                    <p className="text-xs text-gray-400 mt-1">
                      Oleh: {refill.paidByName}
                    </p>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// Pagination Component
const Pagination = ({ pagination, onPageChange, onLimitChange }) => {
  const { page, totalPages, limit } = pagination;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-gray-50">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Tampilkan</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(parseInt(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm text-gray-600">data</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sebelumnya
        </button>
        <span className="text-sm text-gray-600">
          Halaman {page} dari {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
};

export default function AdminPaperRefillsPage() {
  const { isSuperAdmin } = useHubAuth();
  const {
    refills,
    stats,
    filterOptions,
    loading,
    pagination,
    filters,
    applyFilters,
    resetFilters,
    changePage,
    changeLimit,
    changeSort,
    markAsPaid,
    formatDate,
    formatRupiah,
    refresh,
  } = useAdminPaperRefills();

  const [processingId, setProcessingId] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedRefill, setSelectedRefill] = useState(null);

  // ✅ REF untuk scroll container
  const scrollContainerRef = useRef(null);

  const tabs = [
    { id: "users", label: "👥 Users", href: "/hub/admin/users" },
    { id: "printers", label: "🖨️ Printers", href: "/hub/admin/printers" },
    {
      id: "refills",
      label: "💰 Paper Refills",
      href: "/hub/admin/paper-refills",
    },
  ];

  // ✅ Simpan posisi scroll sebelum data berubah
  const saveScrollPosition = () => {
    if (scrollContainerRef.current) {
      const position = scrollContainerRef.current.scrollTop;
      sessionStorage.setItem("paperRefillsScrollPos", position);
      console.log("💾 Saved scroll position:", position);
    }
  };

  // ✅ Kembalikan posisi scroll setelah data selesai dimuat
  useEffect(() => {
    const savedPosition = sessionStorage.getItem("paperRefillsScrollPos");
    if (savedPosition && scrollContainerRef.current && !loading) {
      scrollContainerRef.current.scrollTop = parseInt(savedPosition);
      console.log("🔄 Restored scroll position:", savedPosition);
      sessionStorage.removeItem("paperRefillsScrollPos");
    }
  }, [loading]);

  // ✅ Wrap changePage untuk menyimpan scroll
  const handleChangePage = (newPage) => {
    saveScrollPosition();
    changePage(newPage);
  };

  // ✅ Wrap changeLimit untuk menyimpan scroll
  const handleChangeLimit = (newLimit) => {
    saveScrollPosition();
    changeLimit(newLimit);
  };

  // ✅ Wrap applyFilters untuk menyimpan scroll
  const handleApplyFilters = async (newFilters) => {
    saveScrollPosition();
    await applyFilters(newFilters);
  };

  // ✅ Wrap resetFilters untuk menyimpan scroll
  const handleResetFilters = async () => {
    saveScrollPosition();
    await resetFilters();
  };

  // ✅ Wrap changeSort untuk menyimpan scroll
  const handleChangeSort = (sortBy, sortOrder) => {
    saveScrollPosition();
    changeSort(sortBy, sortOrder);
  };

  const handleMarkAsPaid = (refill) => {
    if (refill.status !== "completed") {
      alert('❌ Hanya refill dengan status "Selesai" yang bisa dibayar');
      return;
    }
    setSelectedRefill(refill);
    setShowProofModal(true);
  };

  const handleConfirmPayment = async (formData) => {
    if (!selectedRefill) return;
    setProcessingId(selectedRefill.refillId);
    const result = await markAsPaid(selectedRefill.refillId, formData);
    if (result.success) {
      alert("✅ Pembayaran berhasil");
      setShowProofModal(false);
      await refresh();
    } else {
      alert("❌ Gagal: " + result.error);
    }
    setProcessingId(null);
  };

  const handleViewProof = (refill) => {
    if (refill.transferProof) {
      window.open(
        `${process.env.NEXT_PUBLIC_VPS_API_URL}${refill.transferProof.url}`,
        "_blank",
      );
    }
  };

  if (!isSuperAdmin()) return null;

  return (
    <AdminLayout tabs={tabs} activeTab="refills">
      {/* ✅ Container dengan ref untuk scroll */}
      <div
        ref={scrollContainerRef}
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            💰 Manajemen Refill Kertas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola semua transaksi pengisian ulang kertas printer
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={loading} />
        <StatusStatsCards stats={stats} loading={loading} />

        {/* Filter Section */}
        <FilterSection
          filters={filters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          options={filterOptions}
          isLoading={loading}
        />

        {/* Sort Section */}
        <SortSection
          currentSort={{ sortBy: filters.sortBy, sortOrder: filters.sortOrder }}
          onSortChange={handleChangeSort}
        />

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Daftar Refill Kertas
            </h2>
            {pagination.total > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                dari {pagination.total} transaksi
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : (
            <>
              <RefillsTable
                refills={refills}
                onMarkAsPaid={handleMarkAsPaid}
                onViewProof={handleViewProof}
                processingId={processingId}
                formatDate={formatDate}
                formatRupiah={formatRupiah}
              />
              {pagination.totalPages > 0 && (
                <Pagination
                  pagination={pagination}
                  onPageChange={handleChangePage}
                  onLimitChange={handleChangeLimit}
                />
              )}
            </>
          )}
        </div>

        {/* Modal Upload Bukti */}
        <ProofUploadModal
          isOpen={showProofModal}
          onClose={() => setShowProofModal(false)}
          onConfirm={handleConfirmPayment}
          refill={selectedRefill}
          processing={processingId === selectedRefill?.refillId}
          formatRupiah={formatRupiah}
        />
      </div>
    </AdminLayout>
  );
}
