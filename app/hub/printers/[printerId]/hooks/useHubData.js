// app/hub/printers/[printerId]/hooks/useHubData.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useHubAuth } from "../../../auth/hooks/useHubAuth";

export const useHubData = (
  printerId,
  initialRefillsPage = 1,
  initialJobsPage = 1,
  initialStartDate = null,
  initialEndDate = null,
) => {
  const { token, user } = useHubAuth();

  const [printer, setPrinter] = useState(null);
  const [printJobs, setPrintJobs] = useState([]);
  const [paperRefills, setPaperRefills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination untuk Paper Refills - diinisialisasi dari params
  const [refillsCurrentPage, setRefillsCurrentPage] =
    useState(initialRefillsPage);
  const [refillsTotalPages, setRefillsTotalPages] = useState(1);
  const [refillsTotalItems, setRefillsTotalItems] = useState(0);
  const [refillsPageSize, setRefillsPageSize] = useState(10);
  const [loadingRefillsPage, setLoadingRefillsPage] = useState(false);

  // Pagination untuk Print Jobs - diinisialisasi dari params
  const [jobsCurrentPage, setJobsCurrentPage] = useState(initialJobsPage);
  const [jobsTotalPages, setJobsTotalPages] = useState(1);
  const [jobsTotalItems, setJobsTotalItems] = useState(0);
  const [jobsPageSize, setJobsPageSize] = useState(10);
  const [loadingJobsPage, setLoadingJobsPage] = useState(false);

  // Date range - diinisialisasi dari params
  const [dateRange, setDateRange] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
    filterType: initialStartDate && initialEndDate ? "custom" : "all",
  });

  // ✅ PISAHKAN useEffect untuk masing-masing state
  useEffect(() => {
    setRefillsCurrentPage(initialRefillsPage);
  }, [initialRefillsPage]);

  useEffect(() => {
    setJobsCurrentPage(initialJobsPage);
  }, [initialJobsPage]);

  useEffect(() => {
    setDateRange({
      startDate: initialStartDate,
      endDate: initialEndDate,
      filterType: initialStartDate && initialEndDate ? "custom" : "all",
    });
  }, [initialStartDate, initialEndDate]);

  // Detect mobile for page size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      setRefillsPageSize(isMobile ? 3 : 8);
      setJobsPageSize(isMobile ? 6 : 10);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!token || !printerId) return;

    setLoadingRefillsPage(true);
    setError(null);

    try {
      // Fetch printer details
      const printerRes = await fetch(`/api/hub/printers/${printerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!printerRes.ok)
        throw new Error(`Failed to fetch printer: ${printerRes.status}`);
      const printerData = await printerRes.json();
      if (printerData.success) setPrinter(printerData.data);

      // Fetch refills dengan pagination
      let refillsUrl = `/api/hub/printers/${printerId}/refills?page=${refillsCurrentPage}&limit=${refillsPageSize}`;

      if (dateRange.startDate && dateRange.endDate) {
        refillsUrl += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }

      const refillsRes = await fetch(refillsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!refillsRes.ok)
        throw new Error(`Failed to fetch refills: ${refillsRes.status}`);

      const refillsData = await refillsRes.json();

      if (refillsData.success) {
        setPaperRefills(refillsData.data);

        // Handle pagination data
        const total = refillsData.pagination?.total || 0;
        setRefillsTotalItems(total);
        setRefillsTotalPages(Math.ceil(total / refillsPageSize) || 1);
      }

      // Fetch print jobs dengan pagination
      let jobsUrl = `/api/hub/printers/${printerId}/jobs?page=${jobsCurrentPage}&limit=${jobsPageSize}`;

      if (dateRange.startDate && dateRange.endDate) {
        jobsUrl += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }

      setLoadingJobsPage(true);
      const jobsRes = await fetch(jobsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (jobsData.success) {
          setPrintJobs(jobsData.data);

          const jobsTotal = jobsData.pagination?.total || 0;
          setJobsTotalItems(jobsTotal);
          setJobsTotalPages(Math.ceil(jobsTotal / jobsPageSize) || 1);
        }
      }
      setLoadingJobsPage(false);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setLoadingRefillsPage(false);
    }
  }, [
    token,
    printerId,
    refillsCurrentPage,
    jobsCurrentPage,
    dateRange,
    refillsPageSize,
    jobsPageSize,
  ]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchAllData();
  }, [fetchAllData]);

  const refreshData = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Reset ketika printerId berubah
  useEffect(() => {
    setRefillsCurrentPage(1);
    setJobsCurrentPage(1);
  }, [printerId]);

  const handleRefillPaper = async () => {
    try {
      if (printer?.paperStatus?.paperCount > 20) {
        return {
          success: false,
          error: "Kapasitas hampir penuh. Tidak bisa menambah kertas.",
        };
      }

      const response = await fetch(`/api/hub/printers/${printerId}/refills`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sheetsAdded: 80 }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        await fetchAllData();
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const markRefillAsPaid = async (refillId) => {
    if (user?.role !== "super_admin") {
      return {
        success: false,
        error: "Hanya super admin yang dapat menandai pembayaran",
      };
    }

    try {
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

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        await fetchAllData();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getJobsByRefill = (refillId) => {
    return printJobs.filter((job) => job.refillId === refillId);
  };

  // Filter functions - sekarang hanya untuk profit calculation
  const filterJobsByDateRange = (jobs) => {
    if (!dateRange.startDate || !dateRange.endDate) return jobs;

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
    if (!dateRange.startDate || !dateRange.endDate) return refills;

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

  // Data yang sudah difilter untuk profit calculation
  const filteredJobs = filterJobsByDateRange(printJobs);
  const filteredRefills = filterRefillsByDateRange(paperRefills);

  // Hitung profit dari semua data (tidak terpengaruh pagination)
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
    loadingRefillsPage,
    error,

    // Pagination untuk Refills
    refillsCurrentPage,
    refillsTotalPages,
    refillsTotalItems,
    refillsPageSize,

    // Pagination untuk Jobs
    jobsCurrentPage,
    jobsTotalPages,
    jobsTotalItems,
    jobsPageSize,
    loadingJobsPage,

    // Data terfilter untuk profit
    filteredJobs,
    filteredRefills: paperRefills,
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
    markRefillAsPaid,
    getJobsByRefill,
    refreshData,
  };
};
