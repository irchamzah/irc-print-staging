"use client";
import { useState, useRef, useEffect } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { UserFormModal } from "../components/UserFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

// Stats Cards Component
const StatsCards = ({ stats, loading }) => {
  const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num || 0);
  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
        <p className="text-xs text-blue-600 mb-1">Total User</p>
        <p className="text-2xl font-bold text-blue-800">
          {formatNumber(stats.total)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-4">
        <p className="text-xs text-purple-600 mb-1">Super Admin</p>
        <p className="text-2xl font-bold text-purple-800">
          {formatNumber(stats.super_admin)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 p-4">
        <p className="text-xs text-green-600 mb-1">Partner</p>
        <p className="text-2xl font-bold text-green-800">
          {formatNumber(stats.partner)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-600 mb-1">User Biasa</p>
        <p className="text-2xl font-bold text-gray-800">
          {formatNumber(stats.user)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 p-4">
        <p className="text-xs text-yellow-600 mb-1">Memiliki Rekening</p>
        <p className="text-2xl font-bold text-yellow-800">
          {formatNumber(stats.hasBankAccount)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-4">
        <p className="text-xs text-orange-600 mb-1">Total Poin</p>
        <p className="text-2xl font-bold text-orange-800">
          {formatNumber(stats.totalPoints)}
        </p>
      </div>
    </div>
  );
};

// Filter Component
const FilterSection = ({ filters, onApply, onReset, isLoading }) => {
  const [local, setLocal] = useState(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const roleOptions = [
    { value: "", label: "Semua Role" },
    { value: "super_admin", label: "Super Admin" },
    { value: "partner", label: "Partner" },
    { value: "user", label: "User" },
  ];

  const hasBankAccountOptions = [
    { value: "", label: "Semua" },
    { value: "true", label: "Memiliki Rekening" },
    { value: "false", label: "Tidak Memiliki Rekening" },
  ];

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
        Filter User
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
            placeholder="Cari nama, nomor HP, atau ID..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Role
          </label>
          <select
            value={local.role}
            onChange={(e) => setLocal({ ...local, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Has Bank Account */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Rekening Bank
          </label>
          <select
            value={local.hasBankAccount}
            onChange={(e) =>
              setLocal({ ...local, hasBankAccount: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {hasBankAccountOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Dari Tanggal
          </label>
          <input
            type="date"
            value={local.startDate}
            onChange={(e) => setLocal({ ...local, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={local.endDate}
            onChange={(e) => setLocal({ ...local, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Points Range */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Poin Minimal
          </label>
          <input
            type="number"
            step="0.01"
            value={local.minPoints}
            onChange={(e) => setLocal({ ...local, minPoints: e.target.value })}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Poin Maksimal
          </label>
          <input
            type="number"
            step="0.01"
            value={local.maxPoints}
            onChange={(e) => setLocal({ ...local, maxPoints: e.target.value })}
            placeholder="999999"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Total Spent Range */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Total Belanja Min
          </label>
          <input
            type="number"
            value={local.minTotalSpent}
            onChange={(e) =>
              setLocal({ ...local, minTotalSpent: e.target.value })
            }
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Total Belanja Max
          </label>
          <input
            type="number"
            value={local.maxTotalSpent}
            onChange={(e) =>
              setLocal({ ...local, maxTotalSpent: e.target.value })
            }
            placeholder="999999999"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
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
    { value: "name", label: "Nama" },
    { value: "role", label: "Role" },
    { value: "points", label: "Poin" },
    { value: "totalSpent", label: "Total Belanja" },
    { value: "updatedAt", label: "Terakhir Update" },
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
      <div className="flex flex-wrap gap-2">
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

// Users Table Component
const UsersTable = ({
  users,
  onEdit,
  onDelete,
  formatDate,
  formatRupiah,
  formatPoints,
}) => {
  const formatRole = (role) => {
    const roleMap = {
      super_admin: {
        label: "Super Admin",
        className: "bg-purple-100 text-purple-700",
      },
      partner: { label: "Partner", className: "bg-green-100 text-green-700" },
      user: { label: "User", className: "bg-blue-100 text-blue-700" },
    };
    const r = roleMap[role] || {
      label: role,
      className: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${r.className}`}>
        {r.label}
      </span>
    );
  };

  const formatBankAccount = (bankAccount) => {
    if (!bankAccount)
      return <span className="text-gray-400 text-xs">Tidak ada</span>;
    return (
      <div className="text-xs">
        <p className="font-medium">{bankAccount.bankName}</p>
        <p className="text-gray-500">{bankAccount.accountNumber}</p>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Nama / ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Nomor HP
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Role
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Poin
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Total Belanja
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Rekening Bank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tanggal Daftar
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-8 text-gray-500">
                Tidak ada data user
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.userId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.userId}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {user.phone}
                </td>
                <td className="px-4 py-3">{formatRole(user.role)}</td>
                <td className="px-4 py-3 text-sm font-medium text-orange-600">
                  {formatPoints(user.points)}
                </td>
                <td className="px-4 py-3 text-sm text-green-600">
                  {formatRupiah(user.totalSpent)}
                </td>
                <td className="px-4 py-3">
                  {formatBankAccount(user.bankAccount)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(user)}
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
export default function AdminUsersPage() {
  const { isSuperAdmin } = useHubAuth();
  const {
    users,
    stats,
    loading,
    pagination,
    filters,
    applyFilters,
    resetFilters,
    changePage,
    changeLimit,
    changeSort,
    createUser,
    updateUser,
    deleteUser,
    formatDate,
    formatRupiah,
    formatPoints,
    refresh,
  } = useAdminUsers();

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState(null);
  const [printers, setPrinters] = useState([]);
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

  const saveScrollPosition = () => {
    if (scrollRef.current) {
      const position = scrollRef.current.scrollTop;
      sessionStorage.setItem("paperRefillsScrollPos", position);
      console.log("💾 Saved scroll position:", position);
    }
  };

  // Fetch printers for partner access
  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const response = await fetch(`/api/hub/admin/printers?limit=1000`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("hubToken")}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setPrinters(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching printers:", error);
      }
    };
    fetchPrinters();
  }, []);

  const handleApplyFilters = async (newFilters) => {
    saveScrollPosition();
    await applyFilters(newFilters);
  };

  const handleResetFilters = async () => {
    saveScrollPosition();
    await resetFilters();
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (formData) => {
    setProcessing(true);
    setFormError(null);

    let result;
    if (selectedUser) {
      result = await updateUser(selectedUser.userId, formData);
    } else {
      result = await createUser(formData);
    }

    if (result.success) {
      setShowFormModal(false);
      setSelectedUser(null);
    } else {
      setFormError(result.error || "Terjadi kesalahan");
    }
    setProcessing(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setProcessing(true);
    const result = await deleteUser(selectedUser.userId);
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedUser(null);
    } else {
      alert("Gagal menghapus user: " + result.error);
    }
    setProcessing(false);
  };

  if (!isSuperAdmin()) return null;

  return (
    <AdminLayout tabs={tabs} activeTab="users">
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              👥 Manajemen User
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola semua user, partner, dan admin
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
            Tambah User
          </button>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={loading} />

        {/* Filter Section */}
        <FilterSection
          filters={filters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
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
            <h2 className="text-lg font-semibold text-gray-800">Daftar User</h2>
            {pagination.total > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                dari {pagination.total} user
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
              <UsersTable
                users={users}
                onEdit={handleEdit}
                onDelete={handleDelete}
                formatDate={formatDate}
                formatRupiah={formatRupiah}
                formatPoints={formatPoints}
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
        <UserFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSubmit}
          user={selectedUser}
          printers={printers}
          error={formError}
          processing={processing}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Hapus User"
          message={`Apakah Anda yakin ingin menghapus user "${selectedUser?.name}"?`}
          processing={processing}
        />
      </div>
    </AdminLayout>
  );
}
