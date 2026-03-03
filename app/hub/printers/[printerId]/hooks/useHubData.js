"use client";
import { useState, useEffect } from "react";
import { useHubAuth } from "../../../auth/hooks/useHubAuth";

export const useHubData = (printerId) => {
  const { token, user } = useHubAuth();

  const [printer, setPrinter] = useState(null);
  const [printJobs, setPrintJobs] = useState([]);
  const [paperRefills, setPaperRefills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    filterType: "all",
  });

  useEffect(() => {
    if (token && printerId) {
      fetchAllData();
    }
  }, [token, printerId]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching printer details from internal API...");

      // Fetch printer details via internal API
      const printerRes = await fetch(`/api/hub/printers/${printerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!printerRes.ok) {
        throw new Error(`Failed to fetch printer: ${printerRes.status}`);
      }

      const printerData = await printerRes.json();

      if (printerData.success) {
        setPrinter(printerData.data);
      } else {
        throw new Error(printerData.error || "Failed to fetch printer");
      }

      // Fetch refills via internal API
      console.log("🔍 Fetching refills via internal API...");
      const refillsRes = await fetch(
        `/api/hub/printers/${printerId}/refills?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!refillsRes.ok) {
        throw new Error(`Failed to fetch refills: ${refillsRes.status}`);
      }

      const refillsData = await refillsRes.json();

      if (refillsData.success) {
        setPaperRefills(refillsData.data);
      } else {
        console.warn("Refills data not in expected format:", refillsData);
      }

      // Fetch print jobs via internal API
      console.log("🔍 Fetching print jobs via internal API...");

      const jobsRes = await fetch(
        `/api/hub/printers/${printerId}/jobs?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!jobsRes.ok) {
        console.warn("Jobs endpoint not available yet");
        setPrintJobs([]);
      } else {
        const jobsData = await jobsRes.json();
        if (jobsData.success) {
          setPrintJobs(jobsData.data);
        }
      }

      console.log("✅ All data fetched successfully");
    } catch (error) {
      console.error("❌ Error fetching hub data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefillPaper = async () => {
    try {
      // Validasi di frontend dulu
      if (printer?.paperStatus?.paperCount > 20) {
        return {
          success: false,
          error: "Kapasitas hampir penuh. Tidak bisa menambah kertas.",
        };
      }

      console.log("🔍 Creating refill via internal API...");

      const response = await fetch(`/api/hub/printers/${printerId}/refills`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sheetsAdded: 80 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        await fetchAllData();
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error refilling paper:", error);
      return { success: false, error: error.message };
    }
  };

  // ✅ TAMBAHKAN FUNGSI INI - Mark refill as paid (hanya untuk super admin)
  const markRefillAsPaid = async (refillId) => {
    // Cek apakah user adalah super admin
    if (user?.role !== "super_admin") {
      return {
        success: false,
        error: "Hanya super admin yang dapat menandai pembayaran",
      };
    }

    try {
      console.log("🔍 Marking refill as paid via internal API...");

      const response = await fetch(
        `/api/hub/admin/paper-refills/${refillId}/pay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        await fetchAllData(); // Refresh data setelah update
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error marking refill as paid:", error);
      return { success: false, error: error.message };
    }
  };

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

  const setCustomDateRange = (startDate, endDate) => {
    setDateRange({
      startDate,
      endDate,
      filterType: "custom",
    });
  };

  const resetDateRange = () => {
    setDateRange({
      startDate: null,
      endDate: null,
      filterType: "all",
    });
  };

  // Data yang sudah difilter
  const filteredJobs = filterJobsByDateRange(printJobs);
  const filteredRefills = filterRefillsByDateRange(paperRefills);

  // Hitung profit
  const totalRevenue = filteredJobs.reduce(
    (sum, job) => sum + (job.totalCost || 0),
    0,
  );
  const totalProfit = filteredRefills.reduce(
    (sum, refill) => sum + (refill.partnerProfit || 0),
    0,
  );
  const pendingPayout = filteredRefills
    .filter((r) => r.status === "active")
    .reduce((sum, r) => sum + (r.partnerProfit || 0), 0);

  const profit = {
    totalRevenue,
    profitShare: paperRefills[0]?.profitShare || 30,
    partnerProfit: totalProfit,
    pendingPayout,
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return {
    printer,
    printJobs,
    paperRefills,
    loading,
    error,

    filteredJobs,
    filteredRefills,
    filteredTotalRevenue: totalRevenue,
    filteredPartnerProfit: totalProfit,
    profit,

    dateRange,
    setCustomDateRange,
    resetDateRange,

    formatRupiah,
    formatDate,
    formatShortDate,
    handleRefillPaper,
    markRefillAsPaid, // ✅ TAMBAHKAN INI
    getJobsByRefill,
    refreshData: fetchAllData,
  };
};
