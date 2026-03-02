// app/hub/hooks/useHubAuth.js
"use client";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useHubAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Cek session saat initial load
  useEffect(() => {
    const savedToken = localStorage.getItem("hubToken");
    const savedUser = localStorage.getItem("hubUser");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Login function
  const login = async (phone, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      const result = await response.json();

      if (result.success) {
        const { user, token, accessiblePrinters } = result.data;

        setUser(user);
        setToken(token);

        // Simpan ke localStorage
        localStorage.setItem("hubToken", token);
        localStorage.setItem("hubUser", JSON.stringify(user));
        localStorage.setItem(
          "accessiblePrinters",
          JSON.stringify(accessiblePrinters),
        );

        setLoading(false);
        return { success: true, user };
      } else {
        setError(result.error || "Login failed");
        setLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError("Network error. Please try again.");
      setLoading(false);
      return { success: false, error: "Network error" };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Hapus dari localStorage
      setUser(null);
      setToken(null);
      localStorage.removeItem("hubToken");
      localStorage.removeItem("hubUser");
      localStorage.removeItem("accessiblePrinters");
    }
  };

  // Get accessible printers from API
  const getAccessiblePrinters = async () => {
    if (!user || !token) return [];

    try {
      const response = await fetch(
        `${API_URL}/api/users/${user.userId}/printers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        console.error("Failed to fetch printers:", result.error);
        return [];
      }
    } catch (error) {
      console.error("Error fetching printers:", error);
      return [];
    }
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

  // Format angka
  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    getAccessiblePrinters,
    formatDate,
    formatNumber,
  };
};
