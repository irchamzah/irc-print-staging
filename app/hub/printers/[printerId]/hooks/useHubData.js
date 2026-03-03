// app/hub/printers/[printerId]/hooks/useHubData.js
"use client";
import { useState, useEffect } from "react";
import { useHubAuth } from "../../../auth/hooks/useHubAuth";

const API_URL = process.env.VPS_API_URL;

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
      console.log("🔍 Fetching printer details...");

      // Fetch printer details
      const printerRes = await fetch(
        `${API_URL}/api/hub/printers/${printerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!printerRes.ok) {
        throw new Error(`Failed to fetch printer: ${printerRes.status}`);
      }

      const printerData = await printerRes.json();

      if (printerData.success) {
        setPrinter(printerData.data);
      } else {
        throw new Error(printerData.error || "Failed to fetch printer");
      }

      // Fetch refills
      console.log("🔍 Fetching refills...");
      const refillsRes = await fetch(
        `${API_URL}/api/hub/printers/${printerId}/refills?limit=100`,
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
      }

      // Fetch print jobs from existing API
      console.log("🔍 Fetching print jobs...");
      const jobsRes = await fetch(`${API_URL}/api/print/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!jobsRes.ok) {
        throw new Error(`Failed to fetch jobs: ${jobsRes.status}`);
      }

      const jobsData = await jobsRes.json();

      if (jobsData.success) {
        const printerJobs = jobsData.jobs.filter(
          (job) => job.printerId === printerId,
        );
        setPrintJobs(printerJobs);
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
      const response = await fetch(
        `${API_URL}/api/hub/printers/${printerId}/refills`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sheetsAdded: 80 }),
        },
      );

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
    getJobsByRefill,
    refreshData: fetchAllData,
  };
};
