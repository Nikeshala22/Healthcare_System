"use client";

import { useEffect, useState } from "react";
import { PATIENT_URL, getAuthHeaders } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import PatientSidebar from "@/components/PatientSidebar";

type HistoryItem = {
  condition: string;
  notes: string;
  recordedAt: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [message, setMessage] = useState("");

  const loadHistory = async () => {
    try {
      const res = await fetch(`${PATIENT_URL}/api/patient/history`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) setHistory(data.history || []);
      else setMessage(data.message || "Failed to load history");
    } catch {
      setMessage("Could not connect to patient service");
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <PatientSidebar />

        <section className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Medical History</h1>

          {message && (
            <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}

          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-slate-500">No medical history available.</p>
            ) : (
              history.map((item, index) => (
                <div key={index} className="rounded-2xl border p-4">
                  <h3 className="font-semibold text-slate-900">{item.condition}</h3>
                  <p className="text-slate-600 mt-1">{item.notes}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(item.recordedAt).toLocaleString()}
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