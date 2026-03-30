"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import DoctorSidebar from "../../../components/DoctorSidebar";
import { NOTIFICATION_URL, getUser } from "../../../lib/api";

type Notification = {
  _id: string;
  type: string;
  subject: string;
  message: string;
  emailStatus: string;
  createdAt: string;
};

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "sent":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export default function DoctorNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState("");

  const loadNotifications = async () => {
    try {
      const user = getUser();
      console.log("Stored user:", user);

      const userId = user?.userId || user?._id || user?.id;

      if (!userId) {
        setMessage("User not found");
        return;
      }

      const res = await fetch(`${NOTIFICATION_URL}/api/notifications/user`, {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications || []);
        setMessage("");
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
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <DoctorSidebar />

        <section className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            My Notifications
          </h1>

          {message && (
            <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-slate-500">No notifications found.</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification._id} className="rounded-2xl border p-4">
                  <h3 className="font-semibold text-slate-900">
                    {notification.subject}
                  </h3>

                  <p className="mt-2 text-slate-700">{notification.message}</p>

                  <p className="mt-2 text-sm text-slate-500">
                    Type: {notification.type}
                  </p>
                  <p className="text-sm text-slate-500">
                    Date: {new Date(notification.createdAt).toLocaleString()}
                  </p>

                  <div className="mt-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                        notification.emailStatus
                      )}`}
                    >
                      Email: {notification.emailStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}