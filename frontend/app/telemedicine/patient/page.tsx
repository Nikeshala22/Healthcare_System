"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PatientSidebar from "@/components/PatientSidebar";
import { TELEMEDICINE_URL, getAuthHeaders } from "@/lib/api";

type Session = {
  _id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  sessionLink: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
};

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "scheduled":
      return "bg-yellow-100 text-yellow-800";
    case "active":
      return "bg-green-100 text-green-800";
    case "ended":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export default function PatientTelemedicinePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [message, setMessage] = useState("");

  const loadSessions = async () => {
    try {
      const res = await fetch(`${TELEMEDICINE_URL}/api/telemedicine/patient`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        setSessions(data.sessions || []);
      } else {
        setMessage(data.message || "Failed to load sessions");
      }
    } catch {
      setMessage("Could not connect to telemedicine service");
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <PatientSidebar />

        <section className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            My Telemedicine Sessions
          </h1>

          {message && (
            <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}

          <div className="space-y-4">
            {sessions.length === 0 ? (
              <p className="text-slate-500">No telemedicine sessions found.</p>
            ) : (
              sessions.map((session) => (
                <div key={session._id} className="rounded-2xl border p-4">
                  <h3 className="font-semibold text-slate-900">
                    Doctor: {session.doctorName}
                  </h3>
                  <p className="text-slate-600">Date: {session.scheduledDate}</p>
                  <p className="text-slate-600">Time: {session.scheduledTime}</p>

                  <div className="mt-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                        session.status
                      )}`}
                    >
                      {session.status}
                    </span>
                  </div>

                  {session.status !== "ended" && (
                    <Link
                      href={`/telemedicine/join?appointmentId=${session.appointmentId}`}
                      className="inline-block mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-white text-sm"
                    >
                      Join Session
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}