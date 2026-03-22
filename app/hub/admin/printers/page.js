"use client";
import { useState, useRef, useEffect } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { useAdminPrinters } from "../hooks/useAdminPrinters";
import { PrinterFormModal } from "../components/PrinterFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

// Stats Cards Component
const StatsCards = ({ stats, loading }) => {
  const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num || 0);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
        <p className="text-xs text-blue-600 mb-1">Total Printer</p>
        <p className="text-2xl font-bold text-blue-800">
          {formatNumber(stats.total)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 p-4">
        <p className="text-xs text-green-600 mb-1">Online</p>
        <p className="text-2xl font-bold text-green-800">
          {formatNumber(stats.online)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-600 mb-1">Offline</p>
        <p className="text-2xl font-bold text-gray-800">
          {formatNumber(stats.offline)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 p-4">
        <p className="text-xs text-yellow-600 mb-1">Kertas &lt; 20</p>
        <p className="text-2xl font-bold text-yellow-800">
          {formatNumber(stats.lowPaper)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 p-4">
        <p className="text-xs text-red-600 mb-1">Kertas Habis</p>
        <p className="text-2xl font-bold text-red-800">
          {formatNumber(stats.outOfPaper)}
        </p>
      </div>
    </div>
  );
};

// Filter Component
const FilterSection = ({ filters, onApply, onReset, options, isLoading }) => {
  const [local, setLocal] = useState(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
    { value: "maintenance", label: "Maintenance" },
  ];

  const paperAvailableOptions = [
    { value: "", label: "Semua" },
    { value: "true", label: "Tersedia" },
    { value: "false", label: "Tidak Tersedia" },
  ];

  const booleanOptions = [
    { value: "", label: "Semua" },
    { value: "true", label: "Ya" },
    { value: "false", label: "Tidak" },
  ];

  const paperCountOptions = [
    { value: "", label: "Semua" },
    { value: "0", label: "0 lembar (Habis)" },
    { value: "1-20", label: "1-20 lembar (Kritis)" },
    { value: "21-50", label: "21-50 lembar (Sedang)" },
    { value: "51-100", label: "51-100 lembar (Cukup)" },
    { value: "100", label: ">100 lembar (Banyak)" },
  ];

  const handlePaperCountChange = (value) => {
    if (value === "") {
      setLocal({ ...local, minPaperCount: "", maxPaperCount: "" });
    } else if (value === "0") {
      setLocal({ ...local, minPaperCount: "0", maxPaperCount: "0" });
    } else if (value === "1-20") {
      setLocal({ ...local, minPaperCount: "1", maxPaperCount: "20" });
    } else if (value === "21-50") {
      setLocal({ ...local, minPaperCount: "21", maxPaperCount: "50" });
    } else if (value === "51-100") {
      setLocal({ ...local, minPaperCount: "51", maxPaperCount: "100" });
    } else if (value === "100") {
      setLocal({ ...local, minPaperCount: "101", maxPaperCount: "" });
    }
  };

  const getPaperCountValue = () => {
    if (!local.minPaperCount && !local.maxPaperCount) return "";
    if (local.minPaperCount === "0" && local.maxPaperCount === "0") return "0";
    if (local.minPaperCount === "1" && local.maxPaperCount === "20")
      return "1-20";
    if (local.minPaperCount === "21" && local.maxPaperCount === "50")
      return "21-50";
    if (local.minPaperCount === "51" && local.maxPaperCount === "100")
      return "51-100";
    if (local.minPaperCount === "101" && !local.maxPaperCount) return "100";
    return "";
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6 border border-purple-200">
      <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
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
        Filter Printer
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Cari
          </label>
          <input
            type="text"
            value={local.search}
            onChange={(e) => setLocal({ ...local, search: e.target.value })}
            placeholder="Cari nama, ID, atau model..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Status
          </label>
          <select
            value={local.status}
            onChange={(e) => setLocal({ ...local, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Kota */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Kota
          </label>
          <select
            value={local.city}
            onChange={(e) => setLocal({ ...local, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Semua Kota</option>
            {options.cities?.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Provinsi */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Provinsi
          </label>
          <select
            value={local.province}
            onChange={(e) => setLocal({ ...local, province: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Semua Provinsi</option>
            {options.provinces?.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        {/* Kertas Tersedia */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Kertas Tersedia
          </label>
          <select
            value={local.paperAvailable}
            onChange={(e) =>
              setLocal({ ...local, paperAvailable: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {paperAvailableOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sisa Kertas */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Sisa Kertas
          </label>
          <select
            value={getPaperCountValue()}
            onChange={(e) => handlePaperCountChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {paperCountOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Warna */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Dukungan Warna
          </label>
          <select
            value={local.hasColor}
            onChange={(e) => setLocal({ ...local, hasColor: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {booleanOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Duplex */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Duplex (2 sisi)
          </label>
          <select
            value={local.hasDuplex}
            onChange={(e) => setLocal({ ...local, hasDuplex: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {booleanOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

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
    { value: "createdAt", label: "Tanggal Dibuat" },
    { value: "name", label: "Nama Printer" },
    { value: "status", label: "Status" },
    { value: "updatedAt", label: "Terakhir Update" },
    { value: "statistics.totalJobs", label: "Total Job" },
  ];

  const handleSortChange = (sortBy) => {
    const newOrder =
      currentSort.sortBy === sortBy && currentSort.sortOrder === "desc"
        ? "asc"
        : "desc";
    onSortChange(sortBy, newOrder);
  };

  return (
    <div className="flex items-center justify-end gap-3 mb-4">
      <span className="text-sm text-gray-500">Urutkan:</span>
      <div className="flex gap-2">
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSortChange(opt.value)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
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

// Printers Table Component
const PrintersTable = ({ printers, onEdit, onDelete, formatDate }) => {
  const formatStatus = (status) => {
    const statusMap = {
      online: { label: "Online", className: "bg-green-100 text-green-700" },
      offline: { label: "Offline", className: "bg-gray-100 text-gray-700" },
      maintenance: {
        label: "Maintenance",
        className: "bg-yellow-100 text-yellow-700",
      },
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

  const formatPaperStatus = (paperStatus) => {
    if (!paperStatus.available) {
      return <span className="text-red-600 font-medium">Habis</span>;
    }
    const count = paperStatus.paperCount || 0;
    if (count <= 20) {
      return (
        <span className="text-yellow-600 font-medium">
          {count} lembar (Kritis)
        </span>
      );
    }
    return <span className="text-green-600">{count} lembar</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Nama
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Model
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Lokasi
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Kertas
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Total Job
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {printers.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                Tidak ada data printer
              </td>
            </tr>
          ) : (
            printers.map((printer) => (
              <tr key={printer.printerId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {printer.name}
                    </p>
                    <p className="text-xs text-gray-500">{printer.printerId}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {printer.model || "-"}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600">
                    {printer.location?.city || "-"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {printer.location?.province || "-"}
                  </p>
                </td>
                <td className="px-4 py-3">{formatStatus(printer.status)}</td>
                <td className="px-4 py-3 text-sm">
                  {formatPaperStatus(printer.paperStatus)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {printer.statistics?.totalJobs || 0} job
                  <br />
                  <span className="text-xs text-gray-400">
                    {printer.statistics?.totalPagesPrinted || 0} halaman
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(printer)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(printer)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      title="Hapus"
                    >
                      Hapus
                    </button>
                  </div>
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

// Main Page
export default function AdminPrintersPage() {
  const { isSuperAdmin } = useHubAuth();
  const {
    printers,
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
    createPrinter,
    updatePrinter,
    deletePrinter,
    formatDate,
    refresh,
  } = useAdminPrinters();

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState(null);
  const scrollRef = useRef(null);

  const tabs = [
    { id: "users", label: "👥 Users", href: "/hub/admin/users" },
    { id: "printers", label: "🖨️ Printers", href: "/hub/admin/printers" },
    {
      id: "refills",
      label: "💰 Paper Refills",
      href: "/hub/admin/paper-refills",
    },
  ];

  const handleAddNew = () => {
    setSelectedPrinter(null);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleEdit = (printer) => {
    setSelectedPrinter(printer);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleDelete = (printer) => {
    setSelectedPrinter(printer);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (formData) => {
    setProcessing(true);
    setFormError(null);

    let result;
    if (selectedPrinter) {
      result = await updatePrinter(selectedPrinter.printerId, formData);
    } else {
      result = await createPrinter(formData);
    }

    if (result.success) {
      setShowFormModal(false);
      setSelectedPrinter(null);
    } else {
      setFormError(result.error || "Terjadi kesalahan");
    }
    setProcessing(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPrinter) return;
    setProcessing(true);
    const result = await deletePrinter(selectedPrinter.printerId);
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedPrinter(null);
    } else {
      alert("Gagal menghapus printer: " + result.error);
    }
    setProcessing(false);
  };

  if (!isSuperAdmin()) return null;

  return (
    <AdminLayout tabs={tabs} activeTab="printers">
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              🖨️ Manajemen Printer
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola semua printer yang terdaftar
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah Printer
          </button>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={loading} />

        {/* Filter Section */}
        <FilterSection
          filters={filters}
          onApply={applyFilters}
          onReset={resetFilters}
          options={filterOptions}
          isLoading={loading}
        />

        {/* Sort Section */}
        <SortSection
          currentSort={{ sortBy: filters.sortBy, sortOrder: filters.sortOrder }}
          onSortChange={changeSort}
        />

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Daftar Printer
            </h2>
            {pagination.total > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                dari {pagination.total} printer
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
              <PrintersTable
                printers={printers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                formatDate={formatDate}
              />
              {pagination.totalPages > 0 && (
                <Pagination
                  pagination={pagination}
                  onPageChange={changePage}
                  onLimitChange={changeLimit}
                />
              )}
            </>
          )}
        </div>

        {/* Modals */}
        <PrinterFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSubmit}
          printer={selectedPrinter}
          error={formError}
          processing={processing}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Hapus Printer"
          message={`Apakah Anda yakin ingin menghapus printer "${selectedPrinter?.name}"?`}
          processing={processing}
        />
      </div>
    </AdminLayout>
  );
}
