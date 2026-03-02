"use client";
import { useState, useEffect } from "react";

// Data dummy users
const dummyUsers = [
  {
    id: "user-001",
    name: "Super Admin",
    phone: "085111222333",
    role: "super_admin",
    password: "admin123", // Untuk demo saja
    accessPrinters: [
      "irc-print-perum-green-garden-jember",
      "irc-print-kaliurang",
      "irc-print-malang",
    ], // Semua printer
  },
  {
    id: "user-002",
    name: "Budi Partner",
    phone: "085111222444",
    role: "partner",
    password: "partner123",
    accessPrinters: ["irc-print-perum-green-garden-jember"], // Hanya 1 printer
  },
  {
    id: "user-003",
    name: "Siti Partner",
    phone: "085111222555",
    role: "partner",
    password: "partner123",
    accessPrinters: ["irc-print-kaliurang"], // Hanya 1 printer
  },
];

// Data dummy printers
const dummyPrinters = [
  {
    printerId: "irc-print-perum-green-garden-jember",
    name: "Irc Print - Perum Green Garden - Jember",
    location: {
      address: "Tegalgede, Sumbersari, Jember",
      city: "Jember",
    },
    status: "online",
    paperStatus: {
      paperCount: 61,
    },
    statistics: {
      totalJobs: 109,
      totalPagesPrinted: 123,
    },
    lastActive: "2026-03-01T14:30:00.000Z",
  },
  {
    printerId: "irc-print-kaliurang",
    name: "Irc Print - Kaliurang - Malang",
    location: {
      address: "Kaliurang, Malang",
      city: "Malang",
    },
    status: "online",
    paperStatus: {
      paperCount: 85,
    },
    statistics: {
      totalJobs: 67,
      totalPagesPrinted: 89,
    },
    lastActive: "2026-03-01T13:15:00.000Z",
  },
  {
    printerId: "irc-print-malang",
    name: "Irc Print - Malang Kota",
    location: {
      address: "Jl. Merdeka No. 45, Malang",
      city: "Malang",
    },
    status: "offline",
    paperStatus: {
      paperCount: 120,
    },
    statistics: {
      totalJobs: 203,
      totalPagesPrinted: 345,
    },
    lastActive: "2026-02-28T10:20:00.000Z",
  },
];

export const useHubAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cek session saat initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("hubUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Login function
  const login = (phone, password) => {
    setLoading(true);
    setError(null);

    // Simulasi API call
    setTimeout(() => {
      const foundUser = dummyUsers.find(
        (u) => u.phone === phone && u.password === password,
      );

      if (foundUser) {
        // Hapus password sebelum disimpan
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem("hubUser", JSON.stringify(userWithoutPassword));
        setLoading(false);
      } else {
        setError("Nomor HP atau password salah");
        setLoading(false);
      }
    }, 1000);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("hubUser");
  };

  // Get accessible printers berdasarkan user
  const getAccessiblePrinters = () => {
    if (!user) return [];

    return dummyPrinters.filter((printer) =>
      user.accessPrinters.includes(printer.printerId),
    );
  };

  // Format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
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
    loading,
    error,
    login,
    logout,
    getAccessiblePrinters,
    formatDate,
    formatNumber,
  };
};
