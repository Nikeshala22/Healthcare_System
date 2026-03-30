"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PatientSidebar from "@/components/PatientSidebar";
import { DOCTOR_URL, getAuthHeaders } from "@/lib/api";

type Prescription = {
  _id: string;
  appointmentId: string;
  doctorName: string;
  diagnosis: string;
  medicines: string;
  instructions: string;
  notes: string;
  createdAt: string;
};

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [message, setMessage] = useState("");

  const loadPrescriptions = async () => {
    try {
      const res = await fetch(`${DOCTOR_URL}/api/doctor/prescriptions/patient`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        setPrescriptions(data.prescriptions || []);
      } else {
        setMessage(data.message || "Failed to load prescriptions");
      }
    } catch {
      setMessage("Could not connect to doctor service");
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
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            My Prescriptions
          </h1>

          {message && (
            <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}

          <div className="space-y-4">
            {prescriptions.length === 0 ? (
              <p className="text-slate-500">No prescriptions found.</p>
            ) : (
              prescriptions.map((prescription) => (
                <div key={prescription._id} className="rounded-2xl border p-4">
                  <p><strong>Doctor:</strong> {prescription.doctorName}</p>
                  <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                  <p><strong>Medicines:</strong> {prescription.medicines}</p>
                  <p><strong>Instructions:</strong> {prescription.instructions}</p>
                  <p><strong>Notes:</strong> {prescription.notes || "-"}</p>
                  <p><strong>Date:</strong> {new Date(prescription.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}