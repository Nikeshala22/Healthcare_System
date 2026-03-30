"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import PatientSidebar from "../../../components/PatientSidebar";
import { PAYMENT_URL, getAuthHeaders } from "../../../lib/api";

type Payment = {
  _id: string;
  doctorName: string;
  amountLkr: number;
  currency: string;
  paypalAmount: number;
  paypalCurrency: string;
  status: string;
  createdAt: string;
};

const getPaymentStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export default function PatientPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [message, setMessage] = useState("");

  const loadPayments = async () => {
    try {
      const res = await fetch(`${PAYMENT_URL}/api/payment/patient`, {
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
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <PatientSidebar />

        <section className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">My Payments</h1>

          {message && (
            <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}

          <div className="space-y-4">
            {payments.length === 0 ? (
              <p className="text-slate-500">No payments found.</p>
            ) : (
              payments.map((payment) => (
                <div key={payment._id} className="rounded-2xl border p-4">
                  <h3 className="font-semibold text-slate-900">
                    Doctor: {payment.doctorName}
                  </h3>
                  <p className="text-slate-600">
                    Amount: Rs. {payment.amountLkr} {payment.currency}
                  </p>
                  <p className="text-slate-600">
                    PayPal Amount: {payment.paypalAmount} {payment.paypalCurrency}
                  </p>
                  <p className="text-slate-600">
                    Date: {new Date(payment.createdAt).toLocaleString()}
                  </p>

                  <div className="mt-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getPaymentStatusStyle(
                        payment.status
                      )}`}
                    >
                      {payment.status}
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