"use client";

import { useEffect, useState } from "react";
import { DOCTOR_URL, getAuthHeaders } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import DoctorSidebar from "@/components/DoctorSidebar";

type Slot = {
  day: string;
  startTime: string;
  endTime: string;
};

export default function DoctorAvailabilityPage() {
  const [availability, setAvailability] = useState<Slot[]>([
    { day: "", startTime: "", endTime: "" },
  ]);
  const [message, setMessage] = useState("");

  const loadAvailability = async () => {
    try {
      const res = await fetch(`${DOCTOR_URL}/api/doctor/availability`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (res.ok && data.availability?.length) {
        setAvailability(data.availability);
      }
    } catch {
      setMessage("Could not connect to doctor service");
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const handleChange = (
    index: number,
    field: keyof Slot,
    value: string
  ) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const addSlot = () => {
    setAvailability([...availability, { day: "", startTime: "", endTime: "" }]);
  };

  const saveAvailability = async () => {
    try {
      const res = await fetch(`${DOCTOR_URL}/api/doctor/availability`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ availability }),
      });

      const data = await res.json();
      setMessage(data.message || "Saved");
    } catch {
      setMessage("Could not connect to doctor service");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <DoctorSidebar />

        <section className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Doctor Availability</h1>

          <div className="space-y-4">
            {availability.map((slot, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Day"
                  value={slot.day}
                  onChange={(e) => handleChange(index, "day", e.target.value)}
                />
                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Start Time"
                  value={slot.startTime}
                  onChange={(e) => handleChange(index, "startTime", e.target.value)}
                />
                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="End Time"
                  value={slot.endTime}
                  onChange={(e) => handleChange(index, "endTime", e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={addSlot}
              className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold"
            >
              Add Slot
            </button>
            <button
              onClick={saveAvailability}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-white font-semibold hover:bg-indigo-700 transition"
            >
              Save Availability
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}