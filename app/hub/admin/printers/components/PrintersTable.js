import CustomLink from "@/app/components/CustomLink";

// Printers Table Component
export const PrintersTable = ({ printers, onEdit, onDelete, formatDate }) => {
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
                    <CustomLink
                      className="text-sm font-medium text-blue-500 hover:underline"
                      href={`/hub/printers/${printer.printerId}`}
                    >
                      {printer.name}
                    </CustomLink>
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
