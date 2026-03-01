"use client";

export const PaperStatusCard = ({
  paperCount,
  lastRefill,
  onRefill,
  loading,
  showSuccess,
  formatDate,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
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
          </div>
          <div>
            <p className="text-sm text-gray-500">Sisa Kertas</p>
            <p className="text-3xl font-bold text-gray-800">{paperCount}</p>
            <p className="text-xs text-gray-400 mt-1">
              Terakhir diisi: {formatDate(lastRefill)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <button
            onClick={onRefill}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2 min-w-[200px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
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
                <span>Isi Ulang Kertas (+80)</span>
              </>
            )}
          </button>

          {showSuccess && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
              ✅ Kertas berhasil ditambahkan!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
