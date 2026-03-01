"use client";
import { useState } from "react";

// Data dummy printer
const dummyPrinter = {
  printerId: "irc-print-perum-green-garden-jember",
  name: "Irc Print - Perum Green Garden - Jember",
  paperStatus: {
    paperCount: 61,
    lastRefill: "2024-01-18T00:00:00.000Z",
  },
  statistics: {
    totalJobs: 109,
    totalPagesPrinted: 123,
  },
};

// Data dummy print jobs
const dummyPrintJobs = [
  {
    jobId: "print-1772376076511-n8jkf8yib",
    fileName: "Empty PDF.pdf",
    totalPages: 1,
    totalCost: 400,
    phoneNumber: "083134752738",
    createdAt: "2026-03-01T14:43:16.476Z",
    status: "completed",
    refillId: "refill-20260301-001",
  },
  {
    jobId: "print-1772376076512-abcd1234",
    fileName: "Dokumen Penting.pdf",
    totalPages: 3,
    totalCost: 1200,
    phoneNumber: "081234567890",
    createdAt: "2026-03-01T10:30:00.000Z",
    status: "completed",
    refillId: "refill-20260301-001",
  },
  {
    jobId: "print-1772376076513-efgh5678",
    fileName: "Foto Keluarga.pdf",
    totalPages: 2,
    totalCost: 3000,
    phoneNumber: "085678901234",
    createdAt: "2026-02-28T15:20:00.000Z",
    status: "completed",
    refillId: "refill-20260228-001",
  },
  {
    jobId: "print-1772376076514-ijkl9012",
    fileName: "Skripsi Bab 1-3.pdf",
    totalPages: 15,
    totalCost: 4500,
    phoneNumber: "089012345678",
    createdAt: "2026-02-28T09:15:00.000Z",
    status: "completed",
    refillId: "refill-20260228-001",
  },
  {
    jobId: "print-1772376076515-mnop3456",
    fileName: "Undangan Pernikahan.pdf",
    totalPages: 2,
    totalCost: 800,
    phoneNumber: "087654321098",
    createdAt: "2026-02-27T14:30:00.000Z",
    status: "completed",
    refillId: "refill-20260227-001",
  },
];

// Data dummy paper refills
const dummyPaperRefills = [
  {
    refillId: "refill-20260301-001",
    filledBy: "Partner 1",
    sheetsAdded: 80,
    paperCountBefore: 61,
    paperCountAfter: 141,
    profitShare: 30,
    totalRevenue: 1600,
    partnerProfit: 480,
    status: "active",
    createdAt: "2026-03-01T09:00:00.000Z",
    jobsCount: 2,
  },
  {
    refillId: "refill-20260228-001",
    filledBy: "Partner 1",
    sheetsAdded: 80,
    paperCountBefore: 101,
    paperCountAfter: 181,
    profitShare: 30,
    totalRevenue: 7500,
    partnerProfit: 2250,
    status: "active",
    createdAt: "2026-02-28T08:30:00.000Z",
    jobsCount: 2,
  },
  {
    refillId: "refill-20260227-001",
    filledBy: "Partner 1",
    sheetsAdded: 80,
    paperCountBefore: 121,
    paperCountAfter: 201,
    profitShare: 30,
    totalRevenue: 800,
    partnerProfit: 240,
    status: "paid",
    createdAt: "2026-02-27T10:15:00.000Z",
    paidAt: "2026-02-28T00:00:00.000Z",
    jobsCount: 1,
  },
];

// Data dummy profit
const dummyProfit = {
  totalRevenue: 9900,
  profitShare: 30,
  partnerProfit: 2970,
  lastPayout: "2026-02-28T00:00:00.000Z",
  pendingPayout: 2730,
};

export const useHubData = (printerId) => {
  const [printer, setPrinter] = useState(dummyPrinter);
  const [printJobs, setPrintJobs] = useState(dummyPrintJobs);
  const [paperRefills, setPaperRefills] = useState(dummyPaperRefills);
  const [profit, setProfit] = useState(dummyProfit);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    filterType: "all", // "all", "custom"
  });

  // Format rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Handle refill paper
  const handleRefillPaper = () => {
    setLoading(true);

    setTimeout(() => {
      const newRefillId = `refill-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-00${paperRefills.length + 1}`;
      const newPaperCount = printer.paperStatus.paperCount + 80;

      setPrinter((prev) => ({
        ...prev,
        paperStatus: {
          ...prev.paperStatus,
          paperCount: newPaperCount,
          lastRefill: new Date().toISOString(),
        },
      }));

      const newRefill = {
        refillId: newRefillId,
        filledBy: "Partner 1",
        sheetsAdded: 80,
        paperCountBefore: printer.paperStatus.paperCount,
        paperCountAfter: newPaperCount,
        profitShare: 30,
        totalRevenue: 0,
        partnerProfit: 0,
        status: "active",
        createdAt: new Date().toISOString(),
        jobsCount: 0,
      };

      setPaperRefills((prev) => [newRefill, ...prev]);
      setLoading(false);
    }, 1500);
  };

  // Get jobs by refill
  const getJobsByRefill = (refillId) => {
    return printJobs.filter((job) => job.refillId === refillId);
  };

  const filterJobsByDateRange = (jobs) => {
    if (
      dateRange.filterType === "all" ||
      !dateRange.startDate ||
      !dateRange.endDate
    ) {
      return jobs;
    }

    const start = new Date(dateRange.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    return jobs.filter((job) => {
      const jobDate = new Date(job.createdAt);
      return jobDate >= start && jobDate <= end;
    });
  };

  const filterRefillsByDateRange = (refills) => {
    if (
      dateRange.filterType === "all" ||
      !dateRange.startDate ||
      !dateRange.endDate
    ) {
      return refills;
    }

    const start = new Date(dateRange.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    return refills.filter((refill) => {
      const refillDate = new Date(refill.createdAt);
      return refillDate >= start && refillDate <= end;
    });
  };

  const resetDateRange = () => {
    setDateRange({
      startDate: null,
      endDate: null,
      filterType: "all",
    });
  };

  const setCustomDateRange = (startDate, endDate) => {
    setDateRange({
      startDate,
      endDate,
      filterType: "custom",
    });
  };

  // Data yang sudah difilter
  const filteredJobs = filterJobsByDateRange(printJobs);
  const filteredRefills = filterRefillsByDateRange(paperRefills);

  // Hitung total berdasarkan data yang difilter
  const filteredTotalRevenue = filteredJobs.reduce(
    (sum, job) => sum + job.totalCost,
    0,
  );
  const filteredPartnerProfit =
    (filteredTotalRevenue * profit.profitShare) / 100;

  return {
    // Data asli
    printer,
    printJobs,
    paperRefills,
    profit,
    loading,

    // Data yang sudah difilter
    filteredJobs,
    filteredRefills,
    filteredTotalRevenue,
    filteredPartnerProfit,

    // Date range state
    dateRange,

    // Functions
    formatRupiah,
    formatDate,
    formatShortDate,
    handleRefillPaper,
    getJobsByRefill,
    setCustomDateRange,
    resetDateRange,
  };
};
