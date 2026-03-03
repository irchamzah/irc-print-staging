// app/hub/admin/users/page.js
"use client";
import { useState } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { UsersTable } from "../components/UsersTable";
import { UserFormModal } from "../components/UserFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

// Data dummy users
const dummyUsers = [
  {
    userId: "user-001",
    name: "Super Admin",
    phone: "085111222333",
    role: "super_admin",
    accessPrinters: [],
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    userId: "user-002",
    name: "Budi Partner",
    phone: "085111222444",
    role: "partner",
    accessPrinters: ["printer-001"],
    createdAt: "2026-01-02T00:00:00.000Z",
  },
  {
    userId: "user-003",
    name: "Siti Partner",
    phone: "085111222555",
    role: "partner",
    accessPrinters: ["printer-002"],
    createdAt: "2026-01-03T00:00:00.000Z",
  },
];

// Data dummy printers (untuk dropdown akses)
const dummyPrinters = [
  {
    printerId: "printer-001",
    name: "Irc Print - Green Garden",
    location: { city: "Jember" },
  },
  {
    printerId: "printer-002",
    name: "Irc Print - Kaliurang",
    location: { city: "Malang" },
  },
  {
    printerId: "printer-003",
    name: "Irc Print - Malang Kota",
    location: { city: "Malang" },
  },
];

export default function AdminUsersPage() {
  const { user } = useHubAuth();
  const [users, setUsers] = useState(dummyUsers);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleSubmit = (formData) => {
    if (selectedUser) {
      // Update
      setUsers(
        users.map((u) =>
          u.userId === selectedUser.userId ? { ...u, ...formData } : u,
        ),
      );
    } else {
      // Create
      const newUser = {
        ...formData,
        userId: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
  };

  const handleDeleteConfirm = () => {
    setUsers(users.filter((u) => u.userId !== selectedUser?.userId));
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
    <AdminLayout tabs={tabs} activeTab="users">
      <UsersTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        formatDate={formatDate}
      />

      <UserFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        user={selectedUser}
        printers={dummyPrinters}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedUser?.name}
      />
    </AdminLayout>
  );
}
