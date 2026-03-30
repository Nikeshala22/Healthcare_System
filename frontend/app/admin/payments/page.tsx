"use client";

import { useEffect, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import AdminSidebar from "@/components/AdminSidebar";
import { PAYMENT_URL, getAuthHeaders } from "@/lib/api";

type Payment = {
  _id: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  amountLkr: number;
  paypalAmount: number;
  paypalCurrency: string;
  status: string;
  createdAt: string;
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [message, setMessage] = useState("");

  const loadPayments = async () => {
    try {
      const res = await fetch(`${PAYMENT_URL}/api/payment/admin/all`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        setPayments(data.payments || []);
      } else {
        setMessage(data.message || "Failed to load payments");
      }
    } catch {
      setMessage("Could not connect to payment service");
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <AdminRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <AdminSidebar />

        <section className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            All Payments
          </h1>

          {message && <p className="mb-4 text-slate-700">{message}</p>}

          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment._id} className="rounded-2xl border p-4">
                <p><strong>Patient:</strong> {payment.patientName}</p>
                <p><strong>Patient Email:</strong> {payment.patientEmail}</p>
                <p><strong>Doctor:</strong> {payment.doctorName}</p>
                <p><strong>LKR Amount:</strong> Rs. {payment.amountLkr}</p>
                <p><strong>PayPal Amount:</strong> {payment.paypalAmount} {payment.paypalCurrency}</p>
                <p><strong>Status:</strong> {payment.status}</p>
                <p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminRoute>
  );
}