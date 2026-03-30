"use client";

import { useState } from "react";
import { DOCTOR_URL, getAuthHeaders } from "@/lib/api";

type Props = {
  appointmentId: string;
  patientId: string;
  patientName: string;
  onSuccess?: () => void;
};

export default function PrescriptionForm({
  appointmentId,
  patientId,
  patientName,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    diagnosis: "",
    medicines: "",
    instructions: "",
    notes: "",
  });

  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${DOCTOR_URL}/api/doctor/prescriptions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          appointmentId,
          patientId,
          patientName,
          diagnosis: form.diagnosis,
          medicines: form.medicines,
          instructions: form.instructions,
          notes: form.notes,
        }),
      });

      const data = await res.json();
      setMessage(data.message || "Done");

      if (res.ok) {
        setForm({
          diagnosis: "",
          medicines: "",
          instructions: "",
          notes: "",
        });
        onSuccess?.();
      }
    } catch {
      setMessage("Could not connect to doctor service");
    }
  };

  return (
    <div className="mt-4 rounded-2xl border p-4 bg-slate-50">
      <h3 className="text-lg font-semibold text-slate-900 mb-3">
        Issue Prescription
      </h3>

      <div className="space-y-3">
        <input
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Diagnosis"
          value={form.diagnosis}
          onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
        />

        <textarea
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Medicines"
          rows={3}
          value={form.medicines}
          onChange={(e) => setForm({ ...form, medicines: e.target.value })}
        />

        <textarea
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Instructions"
          rows={3}
          value={form.instructions}
          onChange={(e) => setForm({ ...form, instructions: e.target.value })}
        />

        <textarea
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Notes (optional)"
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-white"
        >
          Save Prescription
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
    </div>
  );
}