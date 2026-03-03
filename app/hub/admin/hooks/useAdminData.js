// app/hub/admin/hooks/useAdminData.js
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";

const API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

export const useAdminData = () => {
  const { token, user } = useHubAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const [users, setUsers] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [refills, setRefills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refillStats, setRefillStats] = useState({
    total: { totalRefills: 0, totalRevenue: 0, totalProfit: 0, totalSheets: 0 },
    pending: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
  });

  // ✅ Gunakan useRef untuk mencegah multiple fetch
  const fetchedRef = useRef(false);

  // ✅ Gunakan useCallback untuk memoized function
  const fetchAllData = useCallback(async () => {
    if (!token || !isSuperAdmin) return;

    setLoading(true);
    setError(null);

    console.log("API_URL:", API_URL); // ✅ Debugging API_URL

    try {
      // Fetch users
      const usersRes = await fetch(`${API_URL}/api/hub/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!usersRes.ok) {
        throw new Error(`HTTP error! status: ${usersRes.status}`);
      }

      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.data);

      // Fetch printers
      const printersRes = await fetch(`${API_URL}/api/hub/admin/printers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!printersRes.ok) {
        throw new Error(`HTTP error! status: ${printersRes.status}`);
      }

      const printersData = await printersRes.json();
      if (printersData.success) setPrinters(printersData.data);

      // Fetch refills
      const refillsRes = await fetch(
        `${API_URL}/api/hub/admin/paper-refills?limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!refillsRes.ok) {
        throw new Error(`HTTP error! status: ${refillsRes.status}`);
      }

      const refillsData = await refillsRes.json();
      if (refillsData.success) setRefills(refillsData.data);

      // Fetch refill stats
      const statsRes = await fetch(
        `${API_URL}/api/hub/admin/paper-refills/stats/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!statsRes.ok) {
        throw new Error(`HTTP error! status: ${statsRes.status}`);
      }

      const statsData = await statsRes.json();
      if (statsData.success) setRefillStats(statsData.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token, isSuperAdmin]); // ✅ Dependencies yang stabil

  // ✅ useEffect dengan dependencies yang benar
  useEffect(() => {
    // Only fetch if we haven't fetched yet and conditions are met
    if (isSuperAdmin && token && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchAllData();
    }

    // Cleanup function
    return () => {
      // Reset ref when component unmounts
      fetchedRef.current = false;
    };
  }, [isSuperAdmin, token, fetchAllData]); // ✅ Dependencies lengkap

  // User CRUD
  const createUser = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/hub/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchAllData();
      }
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false, error: error.message };
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await fetch(`${API_URL}/api/hub/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchAllData();
      }
      return result;
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/hub/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchAllData();
      }
      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, error: error.message };
    }
  };

  // Printer CRUD
  const createPrinter = async (printerData) => {
    try {
      const response = await fetch(`${API_URL}/api/hub/admin/printers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(printerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchAllData();
      }
      return result;
    } catch (error) {
      console.error("Error creating printer:", error);
      return { success: false, error: error.message };
    }
  };

  const updatePrinter = async (printerId, printerData) => {
    try {
      const response = await fetch(
        `${API_URL}/api/hub/admin/printers/${printerId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(printerData),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchAllData();
      }
      return result;
    } catch (error) {
      console.error("Error updating printer:", error);
      return { success: false, error: error.message };
    }
  };

  const deletePrinter = async (printerId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/hub/admin/printers/${printerId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchAllData();
      }
      return result;
    } catch (error) {
      console.error("Error deleting printer:", error);
      return { success: false, error: error.message };
    }
  };

  // Refill operations
  const markRefillAsPaid = async (refillId, data = {}) => {
    try {
      const response = await fetch(
        `${API_URL}/api/hub/admin/paper-refills/${refillId}/pay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchAllData();
      }
      return result;
    } catch (error) {
      console.error("Error marking refill as paid:", error);
      return { success: false, error: error.message };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return {
    users,
    printers,
    refills,
    refillStats,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    createPrinter,
    updatePrinter,
    deletePrinter,
    markRefillAsPaid,
    refreshData: fetchAllData,
    formatDate,
  };
};
