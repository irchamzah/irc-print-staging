// app/printers/[printerId]/hooks/usePaymentManagement.js (FRONTEND Next.js)
import { useState } from "react";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// usePaymentManagement TERPAKAI
export const usePaymentManagement = (
  printerId,
  setAdvancedSettings,
  setTotalPages,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [refreshingTransactions, setRefreshingTransactions] = useState(false);
  const [cooldownTimers, setCooldownTimers] = useState({});

  // 🌐 handleSubmit /app/printers/[printerId]/hooks/usePaymentManagement.js TERPAKAI
  const handleSubmit = async (
    e,
    file,
    advancedSettings,
    totalPages,
    userSession,
    refreshAllData,
  ) => {
    e.preventDefault();

    if (!file) {
      alert("Silakan upload file terlebih dahulu!");
      return;
    }

    const finalCost = advancedSettings.cost || 0;

    if (finalCost <= 0) {
      alert(
        "Biaya print belum dihitung. Silakan tunggu sebentar atau periksa pengaturan.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const orderId = `print-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Convert file to base64
      const fileBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Create payment
      const paymentResponse = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalCost,
          orderId: orderId,
          phoneNumber: userSession?.phone || null,
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        throw new Error(
          paymentResult.error || "Gagal membuat transaksi payment",
        );
      }

      // Save to database if user is logged in
      if (userSession) {
        const transactionData = {
          phoneNumber: userSession.phone,
          orderId: orderId,
          printerId: printerId,
          fileData: {
            name: file.name,
            size: file.size,
            pages: totalPages,
            type: file.type,
          },
          fileContent: fileBase64,
          settings: {
            ...advancedSettings,
            printSettings: {
              ...advancedSettings.printSettings,
              quality: (
                advancedSettings.printSettings?.quality || "normal"
              ).toLowerCase(), // ✅ Tambah ini
            },
          },
          cost: finalCost,
          paymentToken: paymentResult.token,
          status: "pending",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        };

        await fetch("/api/transactions/pending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionData),
        });
      }

      // Show payment modal
      setPaymentData({
        token: paymentResult.token,
        redirectUrl: paymentResult.redirect_url,
        amount: finalCost,
        orderId: orderId,
      });

      setShowPaymentModal(true);
      setCurrentJobId(orderId);
    } catch (error) {
      console.error("❌ Payment error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌐 handlePaymentSuccess /app/printers/[printerId]/hooks/usePaymentManagement.js TERPAKAI
  const handlePaymentSuccess = async (
    currentJobId,
    advancedSettings,
    printerId,
    file,
    userSession,
    paymentData,
    refreshAllData,
  ) => {
    try {
      setIsLoading(true);

      // ✅ STEP 1: Sinkronkan status transaksi terlebih dahulu
      const syncResponse = await fetch(
        `/api/transactions/pending/sync?phoneNumber=${userSession?.phone}`,
      );

      if (syncResponse.ok) {
        const syncResult = await syncResponse.json();

        // Cari transaksi yang sudah settlement
        const updatedTx = syncResult.updatedTransactions?.find(
          (tx) => tx.orderId === currentJobId,
        );
      }

      // ✅ STEP 2: Cek status pembayaran ke Midtrans
      const statusResponse = await fetch(
        `/api/payment/status?orderId=${currentJobId}`,
      );

      if (!statusResponse.ok) {
        throw new Error(
          `Payment status check failed: ${statusResponse.status}`,
        );
      }

      const statusResult = await statusResponse.json();

      if (!statusResult.success || statusResult.status !== "settlement") {
        setIsLoading(false);
        return;
      }

      // ✅ STEP 3: Kirim print job ke VPS
      const pointDivider = parseInt(
        localStorage.getItem("printerPointDivider"),
      );
      const totalPagesToPrint =
        (advancedSettings.colorPages.length + advancedSettings.bwPages.length) *
        advancedSettings.copies;
      const pointsToAdd = (advancedSettings.cost / pointDivider).toFixed(2);

      const printPayload = {
        orderId: currentJobId,
        printerId: printerId,
        copies: advancedSettings.copies,
        colorPages: JSON.stringify(advancedSettings.colorPages),
        bwPages: JSON.stringify(advancedSettings.bwPages),
        totalCost: advancedSettings.cost,
        totalPages: totalPagesToPrint,
        pointsToAdd: pointsToAdd,
        pointDivider: pointDivider,
        phoneNumber: userSession?.phone,
        isRestoredTransaction: paymentData?.isRestored || false,
      };

      let response;

      if (paymentData?.isRestored) {
        response = await fetch("/api/print", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(printPayload),
        });
      } else {
        const formData = new FormData();
        formData.append("pdf", file);
        Object.keys(printPayload).forEach((key) => {
          formData.append(key, printPayload[key]);
        });

        response = await fetch("/api/print", {
          method: "POST",
          body: formData,
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Print API error response:", errorText);
        throw new Error(
          `Print failed: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();

      if (result.success) {
        // ✅ STEP 4: JANGAN LANGSUNG HAPUS TRANSAKSI DI SINI
        // Biarkan Raspberry Pi yang akan menandai sebagai completed setelah print sukses
        // Hanya refresh data
        if (userSession) {
          setTimeout(() => {
            refreshAllData();
          }, 3000);
        }

        alert(
          `✅ Payment berhasil! File sedang diproses untuk print.\n` +
            `📄 ${totalPagesToPrint} halaman akan dicetak.\n` +
            (userSession
              ? `🎉 +${pointsToAdd} point telah ditambahkan!\nPoint akan di-update otomatis...\n`
              : "") +
            `Job ID: ${result.jobId}\n\nHalaman akan direfresh...`,
        );

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert(`❌ Gagal mengirim file: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error after payment:", error);
      alert(`❌ Error setelah pembayaran: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌐 handlePaymentCancelled /app/printers/[printerId]/hooks/usePaymentManagement.js TERPAKAI
  const handlePaymentCancelled = (refreshAllData) => {
    setShowPaymentModal(false);
    setPaymentData(null);
    // Refresh data ketika modal ditutup
    refreshAllData();
  };

  // 🌐 fetchPendingTransactions /app/printers/[printerId]/hooks/usePaymentManagement.js TERPAKAI
  const fetchPendingTransactions = async (userSession) => {
    if (!userSession?.phone) return;

    setLoadingTransactions(true);
    try {
      const response = await fetch(
        `/api/transactions/pending?phoneNumber=${userSession.phone}`,
      );
      const result = await response.json();

      if (result.success) {
        setPendingTransactions(result.pendingTransactions || []);
      } else {
        console.error("Failed to fetch pending transactions:", result.error);
      }
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // 🌐 continuePendingTransaction /app/printers/[printerId]/hooks/usePaymentManagement.js TERPAKAI
  const continuePendingTransaction = async (transaction, userSession) => {
    if (cooldownTimers[transaction.orderId]) {
      return;
    }

    try {
      setCooldownTimers((prev) => ({ ...prev, [transaction.orderId]: true }));

      const syncResponse = await fetch(
        `/api/payment/status?orderId=${transaction.orderId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(10000),
        },
      );

      if (!syncResponse.ok) {
        const errorText = await syncResponse.text();
        console.error(
          `❌ Payment status check failed: ${syncResponse.status}`,
          errorText,
        );
        await openPaymentModalWithoutSync(transaction, userSession);
        return;
      }

      const syncResult = await syncResponse.json();

      if (syncResult.success) {
        const latestStatus = syncResult.status;

        // ✅ UPDATE: Gunakan paymentStatus dari transaksi
        const currentStatus = transaction.paymentStatus || transaction.status;
        const updatedTransaction = {
          ...transaction,
          midtransStatus: latestStatus,
          paymentStatus:
            latestStatus === "settlement" ? "settlement" : currentStatus,
        };

        if (latestStatus === "settlement") {
          // Update status di backend
          await fetch(`/api/transactions/update-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: transaction.orderId,
              phoneNumber: userSession.phone,
              status: "settlement",
              midtransStatus: latestStatus,
            }),
          });

          // ✅ UPDATE: Ambil settings dari transaction (bukan dari fileData)
          if (transaction.settings) {
            setAdvancedSettings(transaction.settings);
          }

          // ✅ UPDATE: Hitung total pages dari settings
          const totalPagesFromSettings =
            transaction.settings?.totalPages ||
            transaction.settings?.selectedPages?.length ||
            transaction.fileData?.pages ||
            0;
          setTotalPages(totalPagesFromSettings);

          setCurrentJobId(transaction.orderId);
          await processSuccessfulPayment(updatedTransaction, userSession);

          setTimeout(() => {
            setCooldownTimers((prev) => ({
              ...prev,
              [transaction.orderId]: false,
            }));
          }, 3000);
          return;
        }

        // ✅ UPDATE: Cek keberadaan file (gunakan filePath sebagai indikator)
        const hasFile =
          !!transaction.filePath || !!transaction.fileData?.hasFile;

        if (!hasFile) {
          alert(
            "❌ File tidak tersimpan untuk transaksi ini. Silakan buat transaksi baru.",
          );
          setCooldownTimers((prev) => ({
            ...prev,
            [transaction.orderId]: false,
          }));
          return;
        }

        // ✅ UPDATE: Ambil settings dari transaction
        if (transaction.settings) {
          setAdvancedSettings(transaction.settings);
        }

        const totalPagesFromSettings =
          transaction.settings?.totalPages ||
          transaction.settings?.selectedPages?.length ||
          transaction.fileData?.pages ||
          0;
        setTotalPages(totalPagesFromSettings);
        setCurrentJobId(transaction.orderId);

        setPaymentData({
          token:
            transaction.paymentToken ||
            transaction.midtransResponse?.paymentToken,
          redirectUrl:
            transaction.redirectUrl ||
            transaction.midtransResponse?.redirectUrl,
          amount: transaction.amount || transaction.cost,
          orderId: transaction.orderId,
          isRestored: true,
        });

        setShowPaymentModal(true);

        setTimeout(() => {
          setCooldownTimers((prev) => ({
            ...prev,
            [transaction.orderId]: false,
          }));
        }, 3000);
      } else {
        throw new Error(syncResult.error || "Failed to sync with Midtrans");
      }
    } catch (error) {
      console.error("Error continuing transaction:", error);
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        alert(
          "⏰ Timeout saat memeriksa status pembayaran. Membuka halaman pembayaran...",
        );
      } else {
        alert("❌ Gagal memulihkan transaksi: " + error.message);
      }
      await openPaymentModalWithoutSync(transaction, userSession);
    }
  };

  // 🌐 cancelPendingTransaction /app/printers/[printerId]/hooks/usePaymentManagement.js TERPAKAI
  const cancelPendingTransaction = async (transaction, userSession) => {
    // ✅ Tambahkan userSession parameter
    if (
      !window.confirm(
        `Apakah Anda yakin ingin membatalkan transaksi ${transaction.orderId}?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/transactions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: transaction.orderId,
          phoneNumber: userSession.phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("❌ Transaksi berhasil dibatalkan");

        // ✅ Refresh transactions dengan memanggil fetchPendingTransactions
        if (userSession) {
          await fetchPendingTransactions(userSession);
        }
      } else {
        throw new Error(result.error || "Gagal membatalkan transaksi");
      }
    } catch (error) {
      console.error("Error cancelling transaction:", error);
      alert("❌ Gagal membatalkan transaksi: " + error.message);
    }
  };

  // 🌐 processSuccessfulPayment /app/printers/[printerId]/hooks/usePaymentManagement.js TERPAKAI
  const processSuccessfulPayment = async (transaction, userSession) => {
    try {
      setIsLoading(true);

      // ✅ STEP 1: Sinkronkan status transaksi terlebih dahulu
      const syncResponse = await fetch(
        `/api/transactions/pending/sync?phoneNumber=${userSession?.phone}`,
      );

      // ✅ STEP 2: Cek status pembayaran ke Midtrans
      const statusResponse = await fetch(
        `/api/payment/status?orderId=${transaction.orderId}`,
      );

      if (!statusResponse.ok) {
        throw new Error(
          `Payment status check failed: ${statusResponse.status}`,
        );
      }

      const statusResult = await statusResponse.json();

      if (!statusResult.success || statusResult.status !== "settlement") {
        setIsLoading(false);
        alert("❌ Pembayaran belum sukses. Silakan coba lagi.");
        return;
      }

      const pointDivider = parseInt(
        localStorage.getItem("printerPointDivider"),
      );
      const totalPagesToPrint =
        (transaction.settings.colorPages.length +
          transaction.settings.bwPages.length) *
        transaction.settings.copies;
      const pointsToAdd = (transaction.cost / pointDivider).toFixed(2);

      const printPayload = {
        orderId: transaction.orderId,
        printerId: printerId,
        copies: transaction.settings.copies,
        colorPages: JSON.stringify(transaction.settings.colorPages),
        bwPages: JSON.stringify(transaction.settings.bwPages),
        totalCost: transaction.cost,
        totalPages: totalPagesToPrint,
        pointsToAdd: pointsToAdd,
        pointDivider: pointDivider,
        phoneNumber: userSession?.phone,
        isRestoredTransaction: true,
      };

      const response = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(printPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Print API error response:", errorText);
        throw new Error(
          `Print failed: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();

      if (result.success) {
        // ✅ JANGAN PANGGIL /complete DI SINI
        // Biarkan Raspberry Pi yang menandai sebagai completed setelah print sukses

        alert(
          `✅ Print job berhasil dikirim!\n` +
            `📄 ${totalPagesToPrint} halaman akan dicetak.\n` +
            (userSession
              ? `🎉 +${pointsToAdd} point telah ditambahkan!\n`
              : "") +
            `Job ID: ${result.jobId}\n\nHalaman akan direfresh...`,
        );

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || "Gagal mengirim print job");
      }
    } catch (error) {
      console.error("❌ Error processing successful payment:", error);
      alert(`❌ Gagal memproses print: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌐 openPaymentModalWithoutSync /app/printers/[printerId]/hooks/usePaymentManagement.js TERPAKAI
  const openPaymentModalWithoutSync = async (transaction, userSession) => {
    // ✅ UPDATE: Cek keberadaan file (gunakan filePath sebagai indikator)
    const hasFile = !!transaction.filePath || !!transaction.fileData?.hasFile;

    if (!hasFile) {
      alert(
        "❌ File tidak tersimpan untuk transaksi ini. Silakan buat transaksi baru.",
      );
      setCooldownTimers((prev) => ({
        ...prev,
        [transaction.orderId]: false,
      }));
      return;
    }

    // ✅ UPDATE: Ambil settings dari transaction
    if (transaction.settings) {
      setAdvancedSettings(transaction.settings);
    }

    const totalPagesFromSettings =
      transaction.settings?.totalPages ||
      transaction.settings?.selectedPages?.length ||
      transaction.fileData?.pages ||
      0;
    setTotalPages(totalPagesFromSettings);
    setCurrentJobId(transaction.orderId);

    setPaymentData({
      token:
        transaction.paymentToken || transaction.midtransResponse?.paymentToken,
      redirectUrl:
        transaction.redirectUrl || transaction.midtransResponse?.redirectUrl,
      amount: transaction.amount || transaction.cost,
      orderId: transaction.orderId,
      isRestored: true,
    });

    setShowPaymentModal(true);

    setTimeout(() => {
      setCooldownTimers((prev) => ({
        ...prev,
        [transaction.orderId]: false,
      }));
    }, 3000);
  };

  return {
    // States
    isLoading,
    showPaymentModal,
    paymentData,
    currentJobId,
    pendingTransactions,
    loadingTransactions,
    refreshingTransactions,
    cooldownTimers,

    // Setters
    setIsLoading,
    setShowPaymentModal,
    setPaymentData,
    setCurrentJobId,
    setPendingTransactions,
    setLoadingTransactions,
    setRefreshingTransactions,
    setCooldownTimers,

    // Functions
    handleSubmit,
    handlePaymentSuccess,
    handlePaymentCancelled,
    fetchPendingTransactions,
    continuePendingTransaction,
    cancelPendingTransaction,
    processSuccessfulPayment,
  };
};
