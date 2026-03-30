"use client";

import { useEffect, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import AdminSidebar from "@/components/AdminSidebar";
import { AUTH_URL, getAuthHeaders } from "@/lib/api";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
};

type FormState = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "patient" | "doctor";
  phone: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  password: "",
  role: "patient",
  phone: "",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const res = await fetch(`${AUTH_URL}/api/admin/users`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(data.users || []);
        setMessage("");
      } else {
        setMessage(data.message || "Failed to load users");
      }
    } catch {
      setMessage("Could not connect to auth service");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateOrUpdate = async () => {
    try {
      const url = editingUserId
        ? `${AUTH_URL}/api/admin/users/${editingUserId}`
        : `${AUTH_URL}/api/admin/users`;

      const method = editingUserId ? "PUT" : "POST";

      const body = editingUserId
        ? JSON.stringify({
            fullName: form.name,
            email: form.email,
            password: form.password || undefined,
            role: form.role,
            phone: form.phone,
          })
        : JSON.stringify(form);

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body,
      });

      const data = await res.json();
      setMessage(data.message || "Done");

      if (res.ok) {
        setForm(initialForm);
        setEditingUserId(null);
        loadUsers();
      }
    } catch {
      setMessage("Could not connect to auth service");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUserId(user._id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role as "admin" | "patient" | "doctor",
      phone: user.phone || "",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${AUTH_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      setMessage(data.message || "Deleted");

      if (res.ok) {
        loadUsers();
      }
    } catch {
      setMessage("Could not connect to auth service");
    }
  };

  return (
    <AdminRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <AdminSidebar />

        <section className="space-y-6">
          <div className="rounded-3xl bg-white border shadow-sm p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              User Management
            </h1>

            {message && (
              <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {message}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="rounded-2xl border px-4 py-3"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="rounded-2xl border px-4 py-3"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="rounded-2xl border px-4 py-3"
                placeholder={editingUserId ? "New Password (optional)" : "Password"}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <input
                className="rounded-2xl border px-4 py-3"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <select
                className="rounded-2xl border px-4 py-3"
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as "admin" | "patient" | "doctor",
                  })
                }
              >
                <option value="patient">patient</option>
                <option value="doctor">doctor</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCreateOrUpdate}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-white font-semibold"
              >
                {editingUserId ? "Update User" : "Add User"}
              </button>

              {editingUserId && (
                <button
                  onClick={() => {
                    setEditingUserId(null);
                    setForm(initialForm);
                  }}
                  className="rounded-2xl bg-slate-200 px-5 py-3 text-slate-900 font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white border shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">All Users</h2>

            <div className="space-y-4">
              {users.map((user) => (
                <div key={user._id} className="rounded-2xl border p-4">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Date:</strong> {new Date(user.createdAt).toLocaleString()}</p>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(user)}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-white text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-white text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AdminRoute>
  );
}