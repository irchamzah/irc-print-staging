"use client";
import { useState } from "react";

export const WithdrawalModal = ({
  isOpen,
  onClose,
  onSubmit,
  totalAmount,
  processing,
}) => {
  const [notes, setNotes] = useState("");
  const [bankAccount, setBankAccount] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ notes, bankAccount });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Buat Permintaan Withdrawal
          </h3>
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

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-sm text-green-700">Total yang dapat ditarik:</p>
            <p className="text-2xl font-bold text-green-700">
              {formatRupiah(totalAmount)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Bank
            </label>
            <select
              value={bankAccount.bankName}
              onChange={(e) =>
                setBankAccount({ ...bankAccount, bankName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Pilih Bank</option>
              <option value="BCA">Bank BCA</option>
              <option value="BNI">Bank BNI</option>
              <option value="BRI">Bank BRI</option>
              <option value="MANDIRI">Bank Mandiri</option>
              <option value="CIMB">Bank CIMB Niaga</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Rekening
            </label>
            <input
              type="text"
              value={bankAccount.accountNumber}
              onChange={(e) =>
                setBankAccount({
                  ...bankAccount,
                  accountNumber: e.target.value.replace(/\D/g, ""),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
              placeholder="1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Pemilik Rekening
            </label>
            <input
              type="text"
              value={bankAccount.accountName}
              onChange={(e) =>
                setBankAccount({ ...bankAccount, accountName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
              placeholder="Sesuai nama di rekening"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Tambahkan catatan jika diperlukan..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? "Memproses..." : "Ajukan Withdrawal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
