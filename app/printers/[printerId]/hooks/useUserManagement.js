// app/printers/[printerId]/hooks/useUserManagement.js SUDAH DIUPDATE
import { useState } from "react";
import { useParams } from "next/navigation";

// Function to normalize phone number to +628xxxxxxxxx format
function normalizePhoneNumber(phone) {
  if (!phone) return phone;

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // If starts with 0, replace with 62
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }

  // If starts with 8, add 62
  if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }

  // Add + prefix
  return "+" + cleaned;
}

// useUserManagement - UPDATED dengan struktur baru
export const useUserManagement = () => {
  const params = useParams();
  const printerId = params?.printerId;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [userPoints, setUserPoints] = useState(null);
  const [checkingPoints, setCheckingPoints] = useState(false);
  const [refreshingPoints, setRefreshingPoints] = useState(false);
  const [userSession, setUserSession] = useState(null);

  // ============================================
  // getPrinterPointDivider - Get point divider from printer
  // ============================================
  const getPrinterPointDivider = async () => {
    try {
      const cached = localStorage.getItem(`printer_${printerId}_pointDivider`);

      if (cached) {
        const { value, timestamp } = JSON.parse(cached);
        // Cache selama 1 jam
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          return value;
        }
      }

      // Ambil dari API
      const response = await fetch(`/api/printers/${printerId}/point-divider`);
      const data = await response.json();

      const pointDivider = data.pointDivider || 4000;

      // Simpan ke localStorage
      localStorage.setItem(
        `printer_${printerId}_pointDivider`,
        JSON.stringify({
          value: pointDivider,
          timestamp: Date.now(),
        }),
      );

      return pointDivider;
    } catch (error) {
      console.error("Error getting point divider:", error);
      return 4000; // Default fallback
    }
  };

  // ============================================
  // handlePhoneNumberChange
  // ============================================
  const handlePhoneNumberChange = (newPhoneNumber) => {
    setPhoneNumber(newPhoneNumber);
  };

  // ============================================
  // loadUserSession - Load session from localStorage
  // ============================================
  const loadUserSession = () => {
    const savedSession = localStorage.getItem("userSession");
    if (savedSession) {
      const session = JSON.parse(savedSession);
      if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
        setUserSession(session);
        setUserPoints(session.points);
        setPhoneNumber(session.phone);
      } else {
        localStorage.removeItem("userSession");
      }
    }
  };

  // ============================================
  // checkUserPoints - Check user points via API
  // ============================================
  const checkUserPoints = async () => {
    if (!phoneNumber.trim()) {
      alert("Silakan masukkan nomor HP terlebih dahulu");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      alert("Nomor HP harus minimal 10 digit");
      return;
    }

    setCheckingPoints(true);
    try {
      const response = await fetch(
        `/api/users/${cleanPhone}/points?printerId=${printerId}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        if (result.user) {
          // ✅ Ambil points dari response
          const points = result.points || result.user?.points || 0;
          setUserPoints(points);

          const userData = {
            phone: cleanPhone,
            points: points,
            name: result.user?.name || `User ${cleanPhone}`,
            userId: result.user?.userId,
            role: result.user?.role || "customer",
            timestamp: Date.now(),
          };
          setUserSession(userData);
          localStorage.setItem("userSession", JSON.stringify(userData));

          alert(`✅ Berhasil login! Anda memiliki ${points.toFixed(2)} point.`);
        } else if (result.user === null) {
          // User tidak ditemukan, buat baru
          await createNewUserDirect(cleanPhone);
        }
      } else {
        throw new Error(result.error || "Gagal Login");
      }
    } catch (error) {
      console.error("❌ Error checking points:", error);
      await createNewUserDirect(cleanPhone, true);
    } finally {
      setCheckingPoints(false);
    }
  };

  // ============================================
  // createNewUserDirect - Create new user via API
  // ============================================
  const createNewUserDirect = async (phone, isFallback = false) => {
    try {
      // Normalize phone number before creating user
      const normalizedPhone = normalizePhoneNumber(phone);

      // Dapatkan point divider dari printer
      const pointDivider = await getPrinterPointDivider();

      // ✅ Gunakan endpoint POST /api/users (bukan /api/users/points)
      const createResponse = await fetch(`/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone,
          name: `User ${normalizedPhone}`,
          role: "customer",
        }),
      });

      if (createResponse.ok) {
        const result = await createResponse.json();

        if (result.success && result.data) {
          const userData = {
            phone: normalizedPhone,
            points: 0,
            name: result.data.name || `User ${normalizedPhone}`,
            userId: result.data.userId,
            role: result.data.role || "customer",
            timestamp: Date.now(),
          };
          setUserPoints(0);
          setUserSession(userData);
          localStorage.setItem("userSession", JSON.stringify(userData));

          if (isFallback) {
            alert("✅ Nomor HP berhasil didaftarkan! Mulai dengan 0 point.");
          } else {
            alert(
              "✅ Akun baru berhasil dibuat! Anda mendapatkan 0 point awal.",
            );
          }
        } else {
          throw new Error(result.error || "Gagal membuat user baru");
        }
      } else {
        // Fallback: buat user secara lokal
        console.warn("⚠️ API create user failed, using local fallback");
        await createLocalUserFallback(phone);
      }
    } catch (error) {
      console.error("❌ Error creating user:", error);
      await createLocalUserFallback(phone);
    }
  };

  // ============================================
  // createLocalUserFallback - Local fallback if API fails
  // ============================================
  const createLocalUserFallback = async (phone) => {
    const normalizedPhone = normalizePhoneNumber(phone);

    const userData = {
      phone: normalizedPhone,
      points: 0,
      name: `User ${normalizedPhone}`,
      userId: `local-${Date.now()}`,
      role: "customer",
      timestamp: Date.now(),
    };
    setUserPoints(0);
    setUserSession(userData);
    localStorage.setItem("userSession", JSON.stringify(userData));

    alert("⚠️ Sistem point sedang maintenance. Lanjut dengan 0 point.");
  };

  // ============================================
  // logoutUser - Clear user session
  // ============================================
  const logoutUser = () => {
    setUserSession(null);
    setUserPoints(null);
    setPhoneNumber("");
    localStorage.removeItem("userSession");
  };

  return {
    // States
    phoneNumber,
    userPoints,
    checkingPoints,
    refreshingPoints,
    userSession,

    // Setters
    setPhoneNumber,
    setUserPoints,
    setCheckingPoints,
    setRefreshingPoints,
    setUserSession,

    // Functions
    handlePhoneNumberChange,
    loadUserSession,
    checkUserPoints,
    logoutUser,
    createNewUserDirect,
    getPrinterPointDivider,
  };
};
