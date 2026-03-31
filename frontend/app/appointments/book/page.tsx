"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { APPOINTMENT_URL, getAuthHeaders } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

function BookAppointmentContent() {
  const searchParams = useSearchParams();

  const doctorId = searchParams.get("doctorId") || "";
  const doctorName = searchParams.get("doctorName") || "";
  const specialty = searchParams.get("specialty") || "";
  const consultationFee = Number(searchParams.get("consultationFee") || 0);
  const doctorEmail = searchParams.get("doctorEmail") || "";
  const doctorPhone = searchParams.get("doctorPhone") || "";

  const [form, setForm] = useState({
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });

  const [message, setMessage] = useState("");

  const handleBook = async () => {
    try {
      const res = await fetch(`${APPOINTMENT_URL}/api/appointments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          doctorId,
          doctorName,
          specialty,
          consultationFee,
          doctorEmail,
          doctorPhone,
          appointmentDate: form.appointmentDate,
          appointmentTime: form.appointmentTime,
          reason: form.reason,
        }),
      });

      const data = await res.json();
      setMessage(data.message || "Request completed");
    } catch {
      setMessage("Could not connect to appointment service");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="rounded-3xl bg-white border shadow-sm p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Book Appointment
        </h1>

        <div className="mb-6 space-y-2">
          <p><strong>Doctor:</strong> {doctorName}</p>
          <p><strong>Specialty:</strong> {specialty}</p>
          <p><strong>Consultation Fee:</strong> Rs. {consultationFee}</p>
        </div>

        <div className="space-y-4">
          <input
            className="w-full rounded-2xl border px-4 py-3"
            type="date"
            value={form.appointmentDate}
            onChange={(e) =>
              setForm({ ...form, appointmentDate: e.target.value })
            }
          />

          <input
            className="w-full rounded-2xl border px-4 py-3"
            type="time"
            value={form.appointmentTime}
            onChange={(e) =>
              setForm({ ...form, appointmentTime: e.target.value })
            }
          />

          <textarea
            className="w-full rounded-2xl border px-4 py-3"
            placeholder="Reason for appointment"
            rows={4}
            value={form.reason}
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value })
            }
          />

          <button
            onClick={handleBook}
            className="rounded-2xl bg-indigo-600 px-5 py-3 text-white font-semibold"
          >
            Confirm Booking
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="p-6">Loading booking page...</div>}>
        <BookAppointmentContent />
      </Suspense>
    </ProtectedRoute>
  );
}