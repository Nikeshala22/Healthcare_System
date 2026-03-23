"use client";

import { useEffect, useState } from "react";
import { PATIENT_URL, getAuthHeaders } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import PatientSidebar from "@/components/PatientSidebar";

type Prescription = {
  doctorName: string;
  medication: string;
  dosage: string;
  instructions: string;
  issuedAt: string;
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [message, setMessage] = useState("");

  const loadPrescriptions = async () => {
    try {
      const res = await fetch(`${PATIENT_URL}/api/patient/prescriptions`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) setPrescriptions(data.prescriptions || []);
      else setMessage(data.message || "Failed to load prescriptions");
    } catch {
      setMessage("Could not connect to patient service");
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <PatientSidebar />

        <section className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Prescriptions</h1>

          {message && (
            <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}

          <div className="space-y-4">
            {prescriptions.length === 0 ? (
              <p className="text-slate-500">No prescriptions available.</p>
            ) : (
              prescriptions.map((item, index) => (
                <div key={index} className="rounded-2xl border p-4">
                  <h3 className="font-semibold text-slate-900">{item.medication}</h3>
                  <p className="text-slate-600 mt-1">Dosage: {item.dosage}</p>
                  <p className="text-slate-600">Doctor: {item.doctorName}</p>
                  <p className="text-slate-600">Instructions: {item.instructions}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(item.issuedAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}