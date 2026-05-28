// /app/hub/admin/raspberry-devices/components/FilterSection.js
"use client";
import { useState } from "react";

export function FilterSection({
  filters,
  onApply,
  onReset,
  options,
  isLoading,
}) {
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || "",
    status: filters.status || "",
  });

  const handleSearch = (e) => {
    setLocalFilters({ ...localFilters, search: e.target.value });
  };

  const handleStatusChange = (e) => {
    setLocalFilters({ ...localFilters, status: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({ search: "", status: "" });
    onReset();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Cari
            </label>
            <input
              type="text"
              value={localFilters.search}
              onChange={handleSearch}
              placeholder="Nama device, ID, atau IP Address..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📊 Status
            </label>
            <select
              value={localFilters.status}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Semua Status</option>
              {options.statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "active"
                    ? "🟢 Active"
                    : status === "inactive"
                      ? "🔴 Inactive"
                      : "🟡 Maintenance"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Memuat..." : "🔍 Filter"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
