"use client";

export const PaperRefillHistory = ({
  refills,
  onViewRefill,
  formatRupiah,
  formatShortDate,
}) => {
  // Fungsi untuk mendapatkan badge role
  const getRoleBadge = (role) => {
    if (role === "super_admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Partner
      </span>
    );
  };

  if (refills.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            📦 Riwayat Pengisian Kertas
          </h2>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">
            Tidak ada pengisian kertas pada periode ini
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          📦 Riwayat Pengisian Kertas
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Klik untuk melihat detail print jobs per pengisian
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {refills.map((refill) => (
          <div
            key={refill.refillId}
            onClick={() => onViewRefill(refill)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {/* Desktop Layout (sm:flex) */}
            <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
              {/* Left Section - Date and Stats */}
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    refill.status === "paid" ? "bg-green-100" : "bg-blue-100"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 ${
                      refill.status === "paid"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
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
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-800">
                      {formatShortDate(refill.createdAt)}
                    </p>
                    {getRoleBadge(refill.filledByRole)}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {refill.profitShare}% share
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {refill.filledByName} • {refill.sheetsAdded} lembar •{" "}
                    {refill.jobsCount || 0} print jobs
                  </p>
                </div>
              </div>

              {/* Right Section - Financial Info */}
              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Pendapatan</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatRupiah(refill.totalRevenue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Profit</p>
                  <p className="text-sm font-medium text-green-600">
                    {formatRupiah(refill.partnerProfit)}
                  </p>
                </div>
                <div className="w-20">
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-full w-full text-center ${
                      refill.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {refill.status === "paid" ? "Dibayar" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Layout (sm:hidden) */}
            <div className="sm:hidden space-y-3">
              {/* Header with Date and Badges */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      refill.status === "paid" ? "bg-green-100" : "bg-blue-100"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 ${
                        refill.status === "paid"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
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
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {formatShortDate(refill.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    refill.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {refill.status === "paid" ? "Dibayar" : "Pending"}
                </span>
              </div>

              {/* Info Row - Who filled and share */}
              <div className="flex items-center gap-2 flex-wrap">
                {getRoleBadge(refill.filledByRole)}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {refill.profitShare}% share
                </span>
                <span className="text-xs text-gray-500">
                  {refill.filledByName}
                </span>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-gray-500">Kertas</p>
                  <p className="font-medium text-gray-800">
                    {refill.sheetsAdded}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-gray-500">Jobs</p>
                  <p className="font-medium text-gray-800">
                    {refill.jobsCount || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-gray-500">Profit</p>
                  <p className="font-medium text-green-600">
                    {formatRupiah(refill.partnerProfit).replace("Rp", "")}
                  </p>
                </div>
              </div>

              {/* Revenue */}
              <div className="flex justify-between items-center text-sm pt-1 border-t border-gray-100">
                <span className="text-gray-500">Total Pendapatan</span>
                <span className="font-medium text-gray-800">
                  {formatRupiah(refill.totalRevenue)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
