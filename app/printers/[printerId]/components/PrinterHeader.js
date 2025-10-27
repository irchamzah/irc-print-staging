export const PrinterHeader = ({ printer }) => {
  if (!printer) return null;

  const getStatusInfo = (status) => {
    switch (status) {
      case "online":
        return { class: "bg-green-100 text-green-800", text: "🟢 Online" };
      case "offline":
        return { class: "bg-red-100 text-red-800", text: "🔴 Offline" };
      default:
        return {
          class: "bg-yellow-100 text-yellow-800",
          text: "🟡 Maintenance",
        };
    }
  };

  const statusInfo = getStatusInfo(printer.status);

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
              {statusInfo.text}
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">
              {printer.paperStatus?.paperCount || 0} kertas tersedia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
