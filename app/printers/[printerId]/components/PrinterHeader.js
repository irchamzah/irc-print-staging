import Link from "next/link";

export const PrinterHeader = ({ printer }) => {
  if (!printer) return null;

  const getStatusInfo = (status) => {
    switch (status) {
      case "online":
        return {
          class: "bg-green-100 text-green-800 border border-green-200",
          text: "🟢 Online",
          dot: "bg-green-500",
        };
      case "offline":
        return {
          class: "bg-red-100 text-red-800 border border-red-200",
          text: "🔴 Offline • Tidak dapat print",
          dot: "bg-red-500",
        };
      default:
        return {
          class: "bg-yellow-100 text-yellow-800 border border-yellow-200",
          text: "🟡 Maintenance",
          dot: "bg-yellow-500",
        };
    }
  };

  const statusInfo = getStatusInfo(printer.status);

  // Format last seen time
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Tidak diketahui";

    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;

    return lastSeenDate.toLocaleDateString("id-ID");
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
              {printer.name}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1 truncate">
              {printer.location?.address}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusInfo.class}`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${statusInfo.dot}`}
              ></div>
              {statusInfo.text}
            </div>
            <div className="flex flex-col sm:items-end gap-1">
              <p className="text-gray-600 text-xs sm:text-sm">
                📄 {printer.paperStatus?.paperCount || 0} kertas tersedia
              </p>
              {printer.lastSeen && (
                <p className="text-gray-500 text-xs">
                  Terakhir aktif: {formatLastSeen(printer.lastSeen)}
                </p>
              )}
            </div>
            {/* // Tambahkan di bagian kanan header */}
            <Link
              href={`/hub/${printer.printerId}`}
              className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 flex items-center gap-1"
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="hidden sm:inline">Hub Partner</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
