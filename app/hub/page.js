// app/hub/page.js
"use client";
import { useState, useEffect } from "react";
import { useHubAuth } from "./hooks/useHubAuth";
import { LoginForm } from "./components/LoginForm";
import { HubLayout } from "./components/HubLayout";
import { PrinterGrid } from "./components/PrinterGrid";

export default function HubPage() {
  const {
    user,
    token,
    loading: authLoading,
    error,
    login,
    logout,
    getAccessiblePrinters,
    formatDate,
    formatNumber,
  } = useHubAuth();

  const [printers, setPrinters] = useState([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);

  // Load printers when user is logged in
  useEffect(() => {
    if (user && token) {
      loadPrinters();
    }
  }, [user, token]);

  const loadPrinters = async () => {
    setLoadingPrinters(true);
    const printerList = await getAccessiblePrinters();
    setPrinters(printerList);
    setLoadingPrinters(false);
  };

  // Jika belum login, tampilkan form login
  if (!user) {
    return <LoginForm onLogin={login} loading={authLoading} error={error} />;
  }

  // Hitung statistik
  const onlineCount = printers.filter((p) => p.status === "online").length;
  const totalPaper = printers.reduce(
    (sum, p) => sum + (p.paperStatus?.paperCount || 0),
    0,
  );

  return (
    <HubLayout user={user} onLogout={logout}>
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Selamat Datang, {user.name}!
        </h2>
        <p className="text-sm text-gray-500">
          {user.role === "super_admin"
            ? "Anda memiliki akses ke semua printer"
            : `Anda memiliki akses ke ${printers.length} printer`}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Printer</p>
          <p className="text-2xl font-bold text-gray-800">
            {loadingPrinters ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
            ) : (
              printers.length
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Printer Online</p>
          <p className="text-2xl font-bold text-green-600">
            {loadingPrinters ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
            ) : (
              onlineCount
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Kertas</p>
          <p className="text-2xl font-bold text-blue-600">
            {loadingPrinters ? (
              <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
            ) : (
              formatNumber(totalPaper)
            )}
          </p>
        </div>
      </div>

      {/* Printer Grid */}
      {loadingPrinters ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
            >
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <PrinterGrid
          printers={printers}
          formatDate={formatDate}
          formatNumber={formatNumber}
        />
      )}
    </HubLayout>
  );
}
