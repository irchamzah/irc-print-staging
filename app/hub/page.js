"use client";
import { useHubAuth } from "./hooks/useHubAuth";
import { LoginForm } from "./components/LoginForm";
import { HubLayout } from "./components/HubLayout";
import { PrinterGrid } from "./components/PrinterGrid";

export default function HubPage() {
  const {
    user,
    loading,
    error,
    login,
    logout,
    getAccessiblePrinters,
    formatDate,
    formatNumber,
  } = useHubAuth();

  // Jika belum login, tampilkan form login
  if (!user) {
    return <LoginForm onLogin={login} loading={loading} error={error} />;
  }

  // Jika sudah login, tampilkan daftar printer
  const accessiblePrinters = getAccessiblePrinters();

  return (
    <HubLayout user={user} onLogout={logout}>
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Selamat Datang, {user.name}!
        </h2>
        <p className="text-sm text-gray-500">
          Anda memiliki akses ke {accessiblePrinters.length} printer
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Printer</p>
          <p className="text-2xl font-bold text-gray-800">
            {accessiblePrinters.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Printer Online</p>
          <p className="text-2xl font-bold text-green-600">
            {accessiblePrinters.filter((p) => p.status === "online").length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Kertas</p>
          <p className="text-2xl font-bold text-blue-600">
            {accessiblePrinters.reduce(
              (sum, p) => sum + p.paperStatus.paperCount,
              0,
            )}
          </p>
        </div>
      </div>

      {/* Printer Grid */}
      <PrinterGrid
        printers={accessiblePrinters}
        formatDate={formatDate}
        formatNumber={formatNumber}
      />
    </HubLayout>
  );
}
