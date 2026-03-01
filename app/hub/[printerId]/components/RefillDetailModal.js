"use client";

export const RefillDetailModal = ({
  isOpen,
  refill,
  jobs,
  onClose,
  formatRupiah,
  formatDate,
}) => {
  if (!isOpen || !refill) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Detail Pengisian Kertas
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(refill.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
          {/* Info Refill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Kertas Ditambah</p>
              <p className="text-lg font-bold text-gray-800">
                {refill.sheetsAdded}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Stok Awal</p>
              <p className="text-lg font-bold text-gray-800">
                {refill.paperCountBefore}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Stok Akhir</p>
              <p className="text-lg font-bold text-gray-800">
                {refill.paperCountAfter}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Share Profit</p>
              <p className="text-lg font-bold text-green-600">
                {refill.profitShare}%
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Total Pendapatan:</span>
              <span className="text-lg font-bold text-gray-800">
                {formatRupiah(refill.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Profit Anda:</span>
              <span className="text-lg font-bold text-green-600">
                {formatRupiah(refill.partnerProfit)}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <span
                className={`text-sm px-3 py-1 rounded-full ${
                  refill.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {refill.status === "paid"
                  ? "✓ Sudah Dibayar"
                  : "⏳ Menunggu Pembayaran"}
              </span>
            </div>
          </div>

          {/* Related Jobs */}
          <h4 className="font-medium text-gray-800 mb-3">
            Print Jobs Terkait ({jobs?.length || 0})
          </h4>

          <div className="space-y-3">
            {jobs?.map((job) => (
              <div
                key={job.jobId}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{job.fileName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.phoneNumber}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {formatRupiah(job.totalCost)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Profit:{" "}
                      {formatRupiah((job.totalCost * refill.profitShare) / 100)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {job.totalPages} halaman
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
