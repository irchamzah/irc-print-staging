export const TransactionItem = ({
  transaction,
  onContinue,
  onCancel,
  isLoading,
  cooldownTimers,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "settlement":
        return { class: "bg-green-100 text-green-700", text: "✅ Lunas" };
      case "expired":
        return { class: "bg-red-100 text-red-700", text: "❌ Kadaluarsa" };
      default:
        return {
          class: "bg-yellow-100 text-yellow-700",
          text: "⏳ Menunggu Bayar",
        };
    }
  };

  const statusBadge = getStatusBadge(transaction.status);

  return (
    <div className="bg-white rounded-lg border border-purple-100 p-3 sm:p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        {/* Transaction Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
              {transaction.orderId}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${statusBadge.class}`}>
              {statusBadge.text}
            </span>
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
              {transaction.fileData?.pages || 0} halaman
            </span>
          </div>
          <p className="text-sm text-gray-700 font-medium truncate">
            {transaction.fileData?.name || "Unknown File"}
          </p>
          <p className="text-lg font-bold text-purple-600">
            Rp {transaction.cost?.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-gray-500">
            Dibuat:{" "}
            {new Date(transaction.createdAt).toLocaleDateString("id-ID")}
            {transaction.paidAt && (
              <>
                {" "}
                • Lunas:{" "}
                {new Date(transaction.paidAt).toLocaleDateString("id-ID")}
              </>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:flex-col sm:gap-1">
          {transaction.status === "settlement" ? (
            <SettlementButton
              transaction={transaction}
              onContinue={onContinue}
              isLoading={isLoading}
              cooldownTimers={cooldownTimers}
            />
          ) : transaction.status === "pending" ? (
            <PendingButtons
              transaction={transaction}
              onContinue={onContinue}
              onCancel={onCancel}
              isLoading={isLoading}
              cooldownTimers={cooldownTimers}
            />
          ) : (
            <CancelButton onCancel={onCancel} transaction={transaction} />
          )}
        </div>
      </div>
    </div>
  );
};

const SettlementButton = ({
  transaction,
  onContinue,
  isLoading,
  cooldownTimers,
}) => (
  <button
    onClick={() => onContinue(transaction)}
    disabled={isLoading || cooldownTimers[transaction.orderId]}
    className="px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors cursor-pointer flex items-center gap-1"
  >
    {cooldownTimers[transaction.orderId] ? (
      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
    ) : (
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
          d="M5 13l4 4L19 7"
        />
      </svg>
    )}
    {cooldownTimers[transaction.orderId] ? "Loading..." : "Print Sekarang"}
  </button>
);

const PendingButtons = ({
  transaction,
  onContinue,
  onCancel,
  isLoading,
  cooldownTimers,
}) => (
  <>
    <button
      onClick={() => onContinue(transaction)}
      disabled={isLoading || cooldownTimers[transaction.orderId]}
      type="button"
      className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors cursor-pointer flex items-center gap-1"
    >
      {cooldownTimers[transaction.orderId] ? (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
      ) : (
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
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
        </svg>
      )}
      {cooldownTimers[transaction.orderId] ? "Loading..." : "Lanjutkan Bayar"}
    </button>
    <button
      onClick={() => onCancel(transaction)}
      disabled={isLoading}
      type="button"
      className="px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:bg-red-300 transition-colors cursor-pointer flex items-center gap-1"
    >
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      Batalkan
    </button>
  </>
);

const CancelButton = ({ onCancel, transaction }) => (
  <button
    onClick={() => onCancel(transaction)}
    className="px-3 py-2 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-1"
  >
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
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
    Hapus
  </button>
);
