"use client";

import { useEffect, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import AdminSidebar from "@/components/AdminSidebar";
import { NOTIFICATION_URL, getAuthHeaders } from "@/lib/api";

type Notification = {
  _id: string;
  recipientName: string;
  recipientEmail: string;
  type: string;
  subject: string;
  message: string;
  emailStatus: string;
  createdAt: string;
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState("");

  const loadNotifications = async () => {
    try {
      const res = await fetch(`${NOTIFICATION_URL}/api/admin/notifications`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications || []);
      } else {
        setMessage(data.message || "Failed to load notifications");
      }
    } catch {
      setMessage("Could not connect to notification service");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <AdminRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <AdminSidebar />

        <section className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            All Notifications
          </h1>

          {message && <p className="mb-4 text-slate-700">{message}</p>}

          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification._id} className="rounded-2xl border p-4">
                <p><strong>Name:</strong> {notification.recipientName}</p>
                <p><strong>Email:</strong> {notification.recipientEmail}</p>
                <p><strong>Type:</strong> {notification.type}</p>
                <p><strong>Subject:</strong> {notification.subject}</p>
                <p><strong>Message:</strong> {notification.message}</p>
                <p><strong>Email Status:</strong> {notification.emailStatus}</p>
                <p><strong>Date:</strong> {new Date(notification.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminRoute>
  );
}