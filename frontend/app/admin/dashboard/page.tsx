"use client";

import { useEffect, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import AdminSidebar from "@/components/AdminSidebar";
import {
  AUTH_URL,
  APPOINTMENT_URL,
  PAYMENT_URL,
  NOTIFICATION_URL,
  getAuthHeaders,
} from "@/lib/api";

type Summary = {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalPayments: number;
  totalNotifications: number;
  totalRevenueLkr: number;
};

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<Summary>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalPayments: 0,
    totalNotifications: 0,
    totalRevenueLkr: 0,
  });

  const [message, setMessage] = useState("");

  const loadSummary = async () => {
    try {
      const headers = getAuthHeaders();

      const [authRes, appointmentRes, paymentRes, notificationRes] =
        await Promise.all([
          fetch(`${AUTH_URL}/api/admin/summary`, { headers }),
          fetch(`${APPOINTMENT_URL}/api/admin/summary`, { headers }),
          fetch(`${PAYMENT_URL}/api/payment/admin/summary`, { headers }),
          fetch(`${NOTIFICATION_URL}/api/admin/summary`, { headers }),
        ]);

      const authData = await authRes.json();
      const appointmentData = await appointmentRes.json();
      const paymentData = await paymentRes.json();
      const notificationData = await notificationRes.json();

      console.log("AUTH SUMMARY:", authData);
      console.log("APPOINTMENT SUMMARY:", appointmentData);
      console.log("PAYMENT SUMMARY:", paymentData);
      console.log("NOTIFICATION SUMMARY:", notificationData);

      if (!authRes.ok || !appointmentRes.ok || !paymentRes.ok || !notificationRes.ok) {
        setMessage("Failed to load one or more admin summary APIs");
        return;
      }

      setSummary({
        totalPatients: authData.summary?.totalPatients || 0,
        totalDoctors: authData.summary?.totalDoctors || 0,
        totalAppointments: appointmentData.summary?.totalAppointments || 0,
        totalPayments: paymentData.summary?.totalPayments || 0,
        totalNotifications: notificationData.summary?.totalNotifications || 0,
        totalRevenueLkr: paymentData.summary?.totalRevenueLkr || 0,
      });

      setMessage("");
    } catch (error) {
      console.error("Admin dashboard error:", error);
      setMessage("Could not load admin dashboard");
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const cards = [
    { title: "Total Patients", value: summary.totalPatients },
    { title: "Total Doctors", value: summary.totalDoctors },
    { title: "Total Appointments", value: summary.totalAppointments },
    { title: "Total Payments", value: summary.totalPayments },
    { title: "Total Notifications", value: summary.totalNotifications },
  ];

  return (
    <AdminRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <AdminSidebar />

        <section>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Monitor users, appointments, payments, and notifications.
            </p>
          </div>

          {message && (
            <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-3xl bg-white border shadow-sm p-6"
              >
                <h2 className="text-sm font-medium text-slate-500">{card.title}</h2>
                <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminRoute>
  );
}