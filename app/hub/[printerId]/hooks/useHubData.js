// app/hub/[printerId]/hooks/useHubData.js
"use client";
import { useState, useEffect } from "react";
import { useHubAuth } from "../../hooks/useHubAuth";

const API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

export const useHubData = (printerId) => {
  const { token } = useHubAuth();

  const [printer, setPrinter] = useState(null);
  const [printJobs, setPrintJobs] = useState([]);
  const [paperRefills, setPaperRefills] = useState([]);
  const [profit, setProfit] = useState({
    totalRevenue: 0,
    profitShare: 30,
    partnerProfit: 0,
    pendingPayout: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk date range
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    filterType: "all",
  });

  // Fetch all data
  useEffect(() => {
    if (!token || !printerId) return;

    fetchAllData();
  }, [token, printerId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch printer details
      const printerRes = await fetch(`${API_URL}/api/printers/${printerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const printerData = await printerRes.json();

      if (printerData.success) {
        setPrinter(printerData.printer);
      }

      // Fetch refills
      const refillsRes = await fetch(
        `${API_URL}/api/printers/${printerId}/refills?limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const refillsData = await refillsRes.json();

      if (refillsData.success) {
        setPaperRefills(refillsData.data);

        // Hitung profit
        const totalRevenue = refillsData.data.reduce(
          (sum, r) => sum + r.totalRevenue,
          0,
        );
        const partnerProfit = refillsData.data.reduce(
          (sum, r) => sum + r.partnerProfit,
          0,
        );
        const pendingPayout = refillsData.data
          .filter((r) => r.status === "active")
          .reduce((sum, r) => sum + r.partnerProfit, 0);

        setProfit({
          totalRevenue,
          profitShare: refillsData.data[0]?.profitShare || 30,
          partnerProfit,
          pendingPayout,
        });
      }

      // Fetch print jobs
      const jobsRes = await fetch(`${API_URL}/api/print/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobsData = await jobsRes.json();

      if (jobsData.success) {
        // Filter jobs untuk printer ini
        const printerJobs = jobsData.jobs.filter(
          (job) => job.printerId === printerId,
        );
        setPrintJobs(printerJobs);
      }
    } catch (error) {
      console.error("Error fetching hub data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle refill paper
  const handleRefillPaper = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/printers/${printerId}/refills`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sheetsAdded: 80 }),
        },
      );

      const result = await response.json();

      if (result.success) {
        // Refresh data
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

  // Mark refill as paid
  const markRefillAsPaid = async (refillId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/printers/${printerId}/refills/${refillId}/pay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        await fetchAllData();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error marking refill as paid:", error);
      return { success: false, error: error.message };
    }
  };

  // Get jobs by refill
  const getJobsByRefill = (refillId) => {
    return printJobs.filter((job) => job.refillId === refillId);
  };

  // Filter functions
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

  const filteredTotalRevenue = filteredJobs.reduce(
    (sum, job) => sum + job.totalCost,
    0,
  );
  const filteredPartnerProfit =
    (filteredTotalRevenue * profit.profitShare) / 100;

  // Format functions
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  return {
    printer,
    printJobs,
    paperRefills,
    profit,
    loading,
    error,

    // Data yang sudah difilter
    filteredJobs,
    filteredRefills,
    filteredTotalRevenue,
    filteredPartnerProfit,

    // Date range
    dateRange,
    setCustomDateRange,
    resetDateRange,

    // Functions
    formatRupiah,
    formatDate,
    formatShortDate,
    handleRefillPaper,
    markRefillAsPaid,
    getJobsByRefill,
    refreshData: fetchAllData,
  };
};
