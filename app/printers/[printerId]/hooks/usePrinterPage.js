// app/printers/[printerId]/hooks/usePrinterPage.js
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUserManagement } from "./useUserManagement";
import { useFileManagement } from "./useFileManagement";
import { usePaymentManagement } from "./usePaymentManagement";
import { useRefreshData } from "./useRefreshData";

// usePrinterPage TERPAKAI
export const usePrinterPage = () => {
  const params = useParams();
  const printerId = params.printerId;

  const [printer, setPrinter] = useState(null);
  const [finalPrices, setFinalPrices] = useState(null); // ✅ Ganti prices → finalPrices
  const [isPrinterOffline, setIsPrinterOffline] = useState(false);
  const [isPaperInsufficient, setIsPaperInsufficient] = useState(false);
  const [availablePaper, setAvailablePaper] = useState(0);
  const [totalPagesNeeded, setTotalPagesNeeded] = useState(0);
  const [pointDivider, setPointDivider] = useState(0);
  const [enabledFeatures, setEnabledFeatures] = useState(null); // ✅ Tambah untuk fitur yang di-enable

  // Initialize all custom hooks
  const userManagement = useUserManagement();
  const fileManagement = useFileManagement();
  const paymentManagement = usePaymentManagement(
    printerId,
    fileManagement.setAdvancedSettings,
    fileManagement.setTotalPages,
  );

  const refreshData = useRefreshData(
    userManagement.userSession,
    userManagement.setUserPoints,
    userManagement.setUserSession,
    paymentManagement.setPendingTransactions,
    userManagement.setRefreshingPoints,
    paymentManagement.setRefreshingTransactions,
    paymentManagement.setCooldownTimers,
  );

  useEffect(() => {
    fetchPrinterDetails();
  }, [printerId]);

  useEffect(() => {
    if (userManagement.userSession?.phone) {
      paymentManagement.fetchPendingTransactions(userManagement.userSession);
    } else {
      paymentManagement.setPendingTransactions([]);
    }
  }, [userManagement.userSession]);

  useEffect(() => {
    userManagement.loadUserSession();
  }, []);

  useEffect(() => {
    if (printer) {
      const isOffline = printer.status === "offline";
      setIsPrinterOffline(isOffline);
    }
  }, [printer]);

  useEffect(() => {
    checkPaperAvailability();
  }, [
    printer,
    fileManagement.advancedSettings,
    fileManagement.totalPages,
    paymentManagement.pendingTransactions,
  ]);

  // ============================================
  // fetchPrinterDetails - UPDATED dengan struktur baru
  // ============================================
  const fetchPrinterDetails = async () => {
    try {
      const response = await fetch(`/api/printers/${printerId}`);
      const result = await response.json();

      if (result.success) {
        const printerData = result.printer;
        setPrinter(printerData);
        setPointDivider(printerData.pointDivider || 4000);

        // ✅ UPDATE: Gunakan finalPrices dari response (sudah dihitung VPS)
        if (printerData.finalPrices) {
          setFinalPrices(printerData.finalPrices);
          localStorage.setItem(
            "printerFinalPrices",
            JSON.stringify(printerData.finalPrices),
          );
        }

        // ✅ UPDATE: Simpan enabledFeatures untuk validasi frontend
        if (printerData.enabledFeatures) {
          setEnabledFeatures(printerData.enabledFeatures);
        }

        localStorage.setItem(
          "printerPointDivider",
          printerData.pointDivider || 4000,
        );
      }
    } catch (error) {
      console.error("Error fetching printer:", error);
      setIsPrinterOffline(true);
    }
  };

  // ============================================
  // checkPaperAvailability - UPDATED
  // ============================================
  const checkPaperAvailability = () => {
    if (!printer) return;

    const availablePaperCount = printer.paperStatus?.paperCount || 0;
    setAvailablePaper(availablePaperCount);

    let totalNeeded = 0;

    // 1. Hitung dari current transaction (jika ada file)
    if (fileManagement.file && fileManagement.totalPages > 0) {
      const currentPages =
        (fileManagement.advancedSettings.colorPages.length +
          fileManagement.advancedSettings.bwPages.length) *
        fileManagement.advancedSettings.copies;
      totalNeeded += currentPages;
    }

    // 2. Hitung dari pending transactions yang belum settlement
    if (paymentManagement.pendingTransactions.length > 0) {
      const pendingPages = paymentManagement.pendingTransactions
        .filter(
          (tx) =>
            tx.paymentStatus === "pending" || tx.paymentStatus === "settlement",
        )
        .reduce((total, tx) => {
          const txPages = tx.settings?.selectedPages?.length || 0;
          const txCopies = tx.settings?.copies || 1;
          return total + txPages * txCopies;
        }, 0);
      totalNeeded += pendingPages;
    }

    setTotalPagesNeeded(totalNeeded);

    const isInsufficient = totalNeeded > availablePaperCount;
    setIsPaperInsufficient(isInsufficient);
  };

  // ============================================
  // getPricePerSheet - Helper baru untuk ambil harga
  // ============================================
  const getPricePerSheet = (colorMode, paperSize) => {
    if (!finalPrices) return 0;
    return finalPrices[colorMode]?.[paperSize] || 0;
  };

  // ============================================
  // calculateTotalCost - Helper baru untuk hitung total
  // ============================================
  const calculateTotalCost = (colorPages, bwPages, paperSize, copies = 1) => {
    if (!finalPrices) return 0;

    const colorPrice = finalPrices.color?.[paperSize] || 0;
    const bwPrice = finalPrices.monochrome?.[paperSize] || 0;

    const total =
      (colorPages.length * colorPrice + bwPages.length * bwPrice) * copies;
    return total;
  };

  // ============================================
  // handleFileUpload
  // ============================================
  const handleFileUpload = async (selectedFile) => {
    return fileManagement.handleFileUpload(
      selectedFile,
      paymentManagement.setIsLoading,
    );
  };

  // ============================================
  // handleSubmit - UPDATED dengan validasi fitur
  // ============================================
  const handleSubmit = async (e) => {
    if (!userManagement.userSession?.phone) {
      alert(
        "❌ Harus Login terlebih dahulu. Masukkan nomor HP dan klik 'Login'.",
      );
      return;
    }

    if (isPrinterOffline) {
      alert("❌ Printer sedang offline. Tidak dapat melakukan print saat ini.");
      return;
    }

    // ✅ CEK PAPER MODE: Hanya validasi kertas jika mode LIMITED
    const isUnlimitedMode = printer?.paperMode === "unlimited";

    if (!isUnlimitedMode && isPaperInsufficient) {
      alert(
        `❌ Kertas tidak cukup! Butuh ${totalPagesNeeded} halaman, tersedia ${availablePaper} halaman.`,
      );
      return;
    }

    // ✅ VALIDASI: Cek apakah ukuran kertas didukung printer
    const selectedPaperSize = fileManagement.advancedSettings.paperSize || "A4";
    if (
      enabledFeatures &&
      !enabledFeatures.paperSizes?.includes(selectedPaperSize)
    ) {
      alert(
        `❌ Printer ini tidak mendukung ukuran kertas ${selectedPaperSize}. Ukuran yang didukung: ${enabledFeatures.paperSizes?.join(", ")}`,
      );
      return;
    }

    // ✅ VALIDASI: Cek apakah kualitas didukung
    const selectedQuality = (
      fileManagement.advancedSettings.quality || "normal"
    ).toLowerCase();
    if (
      enabledFeatures &&
      !enabledFeatures.qualities?.includes(selectedQuality)
    ) {
      alert(
        `❌ Printer ini tidak mendukung kualitas ${selectedQuality}. Kualitas yang didukung: ${enabledFeatures.qualities?.join(", ")}`,
      );
      return;
    }

    return paymentManagement.handleSubmit(
      e,
      fileManagement.file,
      fileManagement.advancedSettings,
      fileManagement.totalPages,
      userManagement.userSession,
      refreshData.refreshAllData,
    );
  };

  // ============================================
  // handlePaymentSuccess
  // ============================================
  const handlePaymentSuccess = async () => {
    return paymentManagement.handlePaymentSuccess(
      paymentManagement.currentJobId,
      fileManagement.advancedSettings,
      printerId,
      fileManagement.file,
      userManagement.userSession,
      paymentManagement.paymentData,
      refreshData.refreshAllData,
    );
  };

  // ============================================
  // handlePaymentCancelled
  // ============================================
  const handlePaymentCancelled = () => {
    return paymentManagement.handlePaymentCancelled(refreshData.refreshAllData);
  };

  // ============================================
  // handleContinuePendingTransaction - UPDATED
  // ============================================
  const handleContinuePendingTransaction = async (transaction) => {
    // ✅ CEK PAPER MODE: Hanya validasi kertas jika mode LIMITED
    const isUnlimitedMode = printer?.paperMode === "unlimited";

    if (!isUnlimitedMode && isPaperInsufficient) {
      alert(
        `❌ Kertas tidak cukup! Butuh ${totalPagesNeeded} halaman, tersedia ${availablePaper} halaman.`,
      );
      return;
    }

    // ✅ VALIDASI ukuran kertas untuk pending transaction
    const txPaperSize = transaction.settings?.printSettings?.paperSize || "A4";
    if (enabledFeatures && !enabledFeatures.paperSizes?.includes(txPaperSize)) {
      alert(
        `❌ Printer ini tidak lagi mendukung ukuran kertas ${txPaperSize}. Silakan batalkan transaksi dan buat baru.`,
      );
      return;
    }

    return paymentManagement.continuePendingTransaction(
      transaction,
      userManagement.userSession,
    );
  };

  // ============================================
  // handleCancelPendingTransaction
  // ============================================
  const handleCancelPendingTransaction = async (transaction) => {
    return paymentManagement.cancelPendingTransaction(
      transaction,
      userManagement.userSession,
    );
  };

  return {
    // Printer states
    printer,
    finalPrices,
    enabledFeatures,
    volumeDiscounts: printer?.volumeDiscounts || [], // ✅ Tambah volumeDiscounts

    // Paper & printer status
    isPrinterOffline,
    isPaperInsufficient,
    availablePaper,
    totalPagesNeeded,
    pointDivider,

    // ✅ Payment states (ambil manual dari paymentManagement)
    pendingTransactions: paymentManagement.pendingTransactions,
    loadingTransactions: paymentManagement.loadingTransactions,
    refreshingTransactions: paymentManagement.refreshingTransactions,
    cooldownTimers: paymentManagement.cooldownTimers,
    isLoading: paymentManagement.isLoading,
    showPaymentModal: paymentManagement.showPaymentModal,
    paymentData: paymentManagement.paymentData,
    currentJobId: paymentManagement.currentJobId,

    // User states (from useUserManagement)
    userSession: userManagement.userSession,
    userPoints: userManagement.userPoints,
    checkingPoints: userManagement.checkingPoints,
    refreshingPoints: userManagement.refreshingPoints,

    // File states (from useFileManagement)
    file: fileManagement.file,
    advancedSettings: fileManagement.advancedSettings,
    totalPages: fileManagement.totalPages,

    // Refresh state
    isRefreshing: refreshData.isRefreshing,

    // Helper functions
    getPricePerSheet,
    calculateTotalCost,

    // Setters
    setPrinter,

    // User functions
    checkUserPoints: userManagement.checkUserPoints,
    logoutUser: userManagement.logoutUser,
    refreshUserPoints: refreshData.refreshUserPoints,
    handlePhoneNumberChange: userManagement.handlePhoneNumberChange,

    // File functions
    handleFileUpload,
    handleSettingsChange: fileManagement.handleSettingsChange,

    // Payment functions
    handleSubmit,
    handlePaymentSuccess,
    handlePaymentCancelled,
    handleContinuePendingTransaction,
    handleCancelPendingTransaction,
    refreshPendingTransactions: refreshData.refreshPendingTransactions,

    // Refresh all
    refreshAllData: refreshData.refreshAllData,
  };
};
