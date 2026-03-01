"use client";

export const PaperRefillHistory = ({
  refills,
  onViewRefill,
  formatRupiah,
  formatShortDate,
}) => {
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
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
                <div>
                  <p className="font-medium text-gray-800">
                    {formatShortDate(refill.createdAt)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {refill.sheetsAdded} lembar • {refill.jobsCount} print jobs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Pendapatan</p>
                  <p className="font-medium text-gray-800">
                    {formatRupiah(refill.totalRevenue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Profit Anda</p>
                  <p className="font-medium text-green-600">
                    {formatRupiah(refill.partnerProfit)}
                  </p>
                </div>
                <div>
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
