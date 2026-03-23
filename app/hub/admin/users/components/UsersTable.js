// Users Table Component
export const UsersTable = ({
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
