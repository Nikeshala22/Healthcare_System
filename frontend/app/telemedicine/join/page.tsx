"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { TELEMEDICINE_URL, getAuthHeaders } from "@/lib/api";

type Session = {
  _id: string;
  appointmentId: string;
  patientName: string;
  doctorName: string;
  sessionLink: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
};

function JoinTelemedicineContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId") || "";

  const [session, setSession] = useState<Session | null>(null);
  const [message, setMessage] = useState("");

  const loadSession = async () => {
    try {
      const res = await fetch(
        `${TELEMEDICINE_URL}/api/telemedicine/${appointmentId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSession(data.session);
      } else {
        setMessage(data.message || "Failed to load session");
      }
    } catch {
      setMessage("Could not connect to telemedicine service");
    }
  };

  useEffect(() => {
    if (appointmentId) {
      loadSession();
    }
  }, [appointmentId]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="rounded-3xl bg-white border shadow-sm p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Join Telemedicine Session
        </h1>

        {message && (
          <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </p>
        )}

        {!session ? (
          <p className="text-slate-500">Loading session...</p>
        ) : (
          <>
            <div className="mb-6 space-y-2">
              <p><strong>Doctor:</strong> {session.doctorName}</p>
              <p><strong>Patient:</strong> {session.patientName}</p>
              <p><strong>Date:</strong> {session.scheduledDate}</p>
              <p><strong>Time:</strong> {session.scheduledTime}</p>
              <p><strong>Status:</strong> {session.status}</p>
            </div>

            <div className="rounded-2xl overflow-hidden border">
              <iframe
                src={session.sessionLink}
                width="100%"
                height="650"
                allow="camera; microphone; fullscreen; display-capture"
                className="w-full"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function JoinTelemedicinePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="p-6">Loading telemedicine page...</div>}>
        <JoinTelemedicineContent />
      </Suspense>
    </ProtectedRoute>
  );
}