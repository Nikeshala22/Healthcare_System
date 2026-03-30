"use client";

import { useEffect, useState } from "react";
import { APPOINTMENT_URL, TELEMEDICINE_URL, getAuthHeaders } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import DoctorSidebar from "@/components/DoctorSidebar";
import PrescriptionForm from "@/components/PrescriptionForm";
import PatientReportsViewer from "@/components/patientReportViewer";
type Appointment = {
  _id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  consultationFree: number;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: string;
  notes: string;
};

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [message, setMessage] = useState("");
  const [expandedReportsId, setExpandedReportsId] = useState<string | null>(null);
  const [expandedPrescriptionId, setExpandedPrescriptionId] = useState<string | null>(null);
  const loadAppointments = async () => {
    try {
      const res = await fetch(`${APPOINTMENT_URL}/api/appointments/doctor`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (res.ok) {
        setAppointments(data.appointments || []);
      } else {
        setMessage(data.message || "Failed to load appointments");
      }
    } catch {
      setMessage("Could not connect to appointment service");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const updateStatus = async (
    id: string,
    status: "accepted" | "rejected" | "completed"
  ) => {
    try {
      const res = await fetch(
        `${APPOINTMENT_URL}/api/appointments/${id}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      setMessage(data.message || "Updated");
      if (res.ok) loadAppointments();
    } catch {
      setMessage("Could not connect to appointment service");
    }
  };
  const toggleReports = (id: string) => {
    setExpandedReportsId((prev) => (prev === id ? null : id));
  };
  const togglePrescription = (id: string) => {
    setExpandedPrescriptionId((prev) => (prev === id ? null : id));
  };


  const createTelemedicineSession = async (item: Appointment) => {
    try {
      const res = await fetch(`${TELEMEDICINE_URL}/api/telemedicine`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          appointmentId: item._id,
          patientId: item.patientId,
          patientName: item.patientName,
          scheduledDate: item.appointmentDate,
          scheduledTime: item.appointmentTime,
        }),
      });

      const data = await res.json();
      setMessage(data.message || "Telemedicine session created");
    } catch {
      setMessage("Could not connect to telemedicine service");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <DoctorSidebar />

        <section className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Doctor Appointments</h1>

          {message && (
            <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-slate-500">No appointments found.</p>
            ) : (
              appointments.map((item) => (
                <div key={item._id} className="rounded-2xl border p-4">
                  <h3 className="font-semibold text-slate-900">{item.patientName}</h3>
                  <p className="text-slate-600">Email: {item.patientEmail}</p>
                  <p className="text-slate-600">Date: {item.appointmentDate}</p>
                  <p className="text-slate-600">Time: {item.appointmentTime}</p>
                  <p className="text-slate-600">Reason: {item.reason}</p>

                  <div className="mt-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {item.status !== "cancelled" && item.status !== "completed" && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button
                        onClick={() => updateStatus(item._id, "accepted")}
                        className="rounded-xl bg-green-600 px-4 py-2 text-white text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(item._id, "rejected")}
                        className="rounded-xl bg-red-600 px-4 py-2 text-white text-sm"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => updateStatus(item._id, "completed")}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-white text-sm"
                      >
                        Complete
                      </button>
                      {(item.status === "accepted" || item.status === "completed") && (
                        
                      <><button
                          onClick={() => togglePrescription(item._id)}
                          className="rounded-xl bg-indigo-600 px-4 py-2 text-white text-sm"
                        >
                          {expandedPrescriptionId === item._id
                            ? "Hide Prescription Form"
                            : "Issue Prescription"}
                        </button><button
                          onClick={() => toggleReports(item._id)}
                          className="rounded-xl bg-slate-800 px-4 py-2 text-white text-sm"
                        >
                            {expandedReportsId === item._id
                              ? "Hide Medical Reports"
                              : "View Medical Reports"}
                          </button></>
                      )}
                      {expandedReportsId === item._id && (
                    <PatientReportsViewer patientId={item.patientId} />
                  )}
                      {expandedPrescriptionId === item._id && (
                        <PrescriptionForm
                          appointmentId={item._id}
                          patientId={item.patientId}
                          patientName={item.patientName}
                          onSuccess={() => {
                            setMessage("Prescription created successfully");
                            setExpandedPrescriptionId(null);
                          }}
                        />
                      )}
                      {item.status === "accepted" && (
                        <button
                          onClick={() => createTelemedicineSession(item)}
                          className="rounded-xl bg-indigo-600 px-4 py-2 text-white text-sm"
                        >
                          Create Telemedicine Session
                        </button>
                      )}


                    </div>
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