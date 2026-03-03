// app/hub/admin/printers/page.js
"use client";
import { useState } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { PrintersTable } from "../components/PrintersTable";
import { PrinterFormModal } from "../components/PrinterFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

// Data dummy printers
const dummyPrinters = [
  {
    printerId: "printer-001",
    name: "Irc Print - Perum Green Garden",
    location: { city: "Jember", address: "Tegalgede, Sumbersari" },
    status: "online",
    paperStatus: { paperCount: 61 },
    statistics: { totalJobs: 109, totalPagesPrinted: 123 },
    pricing: { color: 1500, bw: 500 },
    profitSettings: { defaultShare: 20, partnerShare: 30, paperPackSize: 80 },
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    printerId: "printer-002",
    name: "Irc Print - Kaliurang",
    location: { city: "Malang", address: "Kaliurang" },
    status: "online",
    paperStatus: { paperCount: 85 },
    statistics: { totalJobs: 67, totalPagesPrinted: 89 },
    pricing: { color: 1500, bw: 500 },
    profitSettings: { defaultShare: 20, partnerShare: 30, paperPackSize: 80 },
    createdAt: "2026-01-02T00:00:00.000Z",
  },
  {
    printerId: "printer-003",
    name: "Irc Print - Malang Kota",
    location: { city: "Malang", address: "Jl. Merdeka No. 45" },
    status: "offline",
    paperStatus: { paperCount: 120 },
    statistics: { totalJobs: 203, totalPagesPrinted: 345 },
    pricing: { color: 1500, bw: 500 },
    profitSettings: { defaultShare: 20, partnerShare: 30, paperPackSize: 80 },
    createdAt: "2026-01-03T00:00:00.000Z",
  },
];

export default function AdminPrintersPage() {
  const { user } = useHubAuth();
  const [printers, setPrinters] = useState(dummyPrinters);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleCreate = () => {
    setSelectedPrinter(null);
    setShowModal(true);
  };

  const handleEdit = (printer) => {
    setSelectedPrinter(printer);
    setShowModal(true);
  };

  const handleDelete = (printer) => {
    setSelectedPrinter(printer);
    setShowDeleteModal(true);
  };

  const handleSubmit = (formData) => {
    if (selectedPrinter) {
      // Update
      setPrinters(
        printers.map((p) =>
          p.printerId === selectedPrinter.printerId ? { ...p, ...formData } : p,
        ),
      );
    } else {
      // Create
      const newPrinter = {
        ...formData,
        printerId: `printer-${Date.now()}`,
        statistics: { totalJobs: 0, totalPagesPrinted: 0 },
        createdAt: new Date().toISOString(),
      };
      setPrinters([...printers, newPrinter]);
    }
    setShowModal(false);
  };

  const handleDeleteConfirm = () => {
    setPrinters(
      printers.filter((p) => p.printerId !== selectedPrinter?.printerId),
    );
    setShowDeleteModal(false);
  };

  const tabs = [
    { id: "users", label: "👥 Users", href: "/hub/admin/users" },
    { id: "printers", label: "🖨️ Printers", href: "/hub/admin/printers" },
    {
      id: "refills",
      label: "💰 Paper Refills",
      href: "/hub/admin/paper-refills",
    },
  ];

  return (
    <AdminLayout tabs={tabs} activeTab="printers">
      <PrintersTable
        printers={printers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        formatDate={formatDate}
      />

      <PrinterFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        printer={selectedPrinter}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedPrinter?.name}
      />
    </AdminLayout>
  );
}
