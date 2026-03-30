"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import PatientSidebar from "../../../components/PatientSidebar";
import { APPOINTMENT_URL, getAuthHeaders } from "../../../lib/api";
import PayPalCheckoutButton from "../../../components/PayPalCheckoutButton";

type Appointment = {
  _id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  consultationFee?: number;
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

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [message, setMessage] = useState("");

  const loadAppointments = async () => {
    try {
      const res = await fetch(`${APPOINTMENT_URL}/api/appointments/patient`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      console.log("Appointments response:", data);

      if (res.ok) {
        setAppointments(data.appointments || []);
        setMessage("");
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

  const cancelAppointment = async (id: string) => {
    try {
      const res = await fetch(
        `${APPOINTMENT_URL}/api/appointments/${id}/cancel`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      const data = await res.json();
      setMessage(data.message || "Updated");

      if (res.ok) {
        loadAppointments();
      }
    } catch {
      setMessage("Could not connect to appointment service");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <PatientSidebar />

        <section className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            My Appointments
          </h1>

          {message && (
            <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-slate-500">No appointments found.</p>
            ) : (
              appointments.map((item) => {
                const fee = Number(item.consultationFee);

                return (
                  <div key={item._id} className="rounded-2xl border p-4">
                    <h3 className="font-semibold text-slate-900">
                      {item.doctorName}
                    </h3>
                    <p className="text-slate-600">Specialty: {item.specialty}</p>
                    <p className="text-slate-600">Fee: Rs. {Number(item.consultationFee || 0)}</p>
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
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-white text-sm"
                      >
                        Cancel Appointment
                      </button>
                    )}

                    {item.status === "accepted" &&
                      fee > 0 &&
                      item.doctorId &&
                      item.doctorName && (
                        <div className="mt-4 max-w-sm">
                          <PayPalCheckoutButton
                            appointmentId={item._id}
                            doctorId={item.doctorId}
                            doctorName={item.doctorName}
                            amount={fee}
                            onSuccess={() => window.location.reload()}
                          />
                        </div>
                      )}

                    {fee <= 0 && (
                      <p className="mt-4 text-sm text-red-600">
                        Consultation fee not available for this appointment.
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}