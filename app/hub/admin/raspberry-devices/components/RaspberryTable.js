// /app/hub/admin/raspberry-devices/components/RaspberryTable.js
"use client";
import { useState } from "react";

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
    maintenance: "bg-yellow-100 text-yellow-800",
  };

  const labels = {
    active: "🟢 Active",
    inactive: "🔴 Inactive",
    maintenance: "🟡 Maintenance",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.inactive}`}
    >
      {labels[status] || status}
    </span>
  );
};

const LastHeartbeatBadge = ({ lastHeartbeat }) => {
  if (!lastHeartbeat)
    return <span className="text-gray-400 text-sm">Never</span>;

  const now = new Date();
  const last = new Date(lastHeartbeat);
  const diffMinutes = Math.floor((now - last) / 60000);

  if (diffMinutes < 1)
    return <span className="text-green-600 text-sm">Just now</span>;
  if (diffMinutes < 5)
    return (
      <span className="text-green-600 text-sm">{diffMinutes} min ago</span>
    );
  if (diffMinutes < 60)
    return (
      <span className="text-yellow-600 text-sm">{diffMinutes} min ago</span>
    );

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return (
      <span className="text-orange-600 text-sm">{diffHours} hours ago</span>
    );

  return (
    <span className="text-red-600 text-sm">
      {Math.floor(diffHours / 24)} days ago
    </span>
  );
};

const handleScanUSB = async (device) => {
  try {
    const response = await fetch(
      `/api/hub/admin/raspberry-devices/${device._id}/scan-usb`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const result = await response.json();
    if (result.success) {
      toast.success("Scan requested, waiting for response...");

      // Poll untuk hasil (atau WebSocket realtime)
      pollForResult(device._id);
    }
  } catch (error) {
    console.error("Scan failed:", error);
  }
};

export function RaspberryTable({
  devices,
  onEdit,
  onAssign,
  onDelete,
  formatDate,
  pagination,
  onPageChange,
  onLimitChange,
}) {
  const [itemsPerPage, setItemsPerPage] = useState(pagination.limit);

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    onLimitChange(newLimit);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Printers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Heartbeat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-lg font-medium">Tidak ada data</p>
                    <p className="text-sm">
                      Belum ada Raspberry device yang terdaftar
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              devices.map((device) => (
                <tr
                  key={device._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {device.name}
                      </div>
                      <div className="text-sm text-gray-500">{device._id}</div>
                      {device.version && (
                        <div className="text-xs text-gray-400 mt-1">
                          v{device.version}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={device.status} />
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {device.ipAddress || "-"}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {device.assignedPrinters &&
                      device.assignedPrinters.length > 0 ? (
                        <>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {device.assignedPrinters.length} printers
                          </span>
                          <button
                            onClick={() => onAssign(device)}
                            className="text-xs text-blue-600 hover:text-blue-800 ml-1"
                          >
                            Manage
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onAssign(device)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Assign printers
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <LastHeartbeatBadge lastHeartbeat={device.lastHeartbeat} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(device.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit(device)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Edit"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(device)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show</span>
            <select
              value={itemsPerPage}
              onChange={handleLimitChange}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-500">entries</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
