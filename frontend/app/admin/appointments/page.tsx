"use client";

import { useEffect, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import AdminSidebar from "@/components/AdminSidebar";
import { APPOINTMENT_URL, getAuthHeaders } from "@/lib/api";

type Appointment = {
  _id: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorEmail: string;
  specialty: string;
  consultationFee: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  createdAt: string;
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [message, setMessage] = useState("");

  const loadAppointments = async () => {
    try {
      const res = await fetch(`${APPOINTMENT_URL}/api/admin/appointments`, {
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

  return (
    <AdminRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <AdminSidebar />

        <section className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            All Appointments
          </h1>

          {message && <p className="mb-4 text-slate-700">{message}</p>}

          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="rounded-2xl border p-4">
                <p><strong>Patient:</strong> {appointment.patientName}</p>
                <p><strong>Patient Email:</strong> {appointment.patientEmail}</p>
                <p><strong>Doctor:</strong> {appointment.doctorName}</p>
                <p><strong>Doctor Email:</strong> {appointment.doctorEmail}</p>
                <p><strong>Specialty:</strong> {appointment.specialty}</p>
                <p><strong>Fee:</strong> Rs. {appointment.consultationFee}</p>
                <p><strong>Date:</strong> {appointment.appointmentDate}</p>
                <p><strong>Time:</strong> {appointment.appointmentTime}</p>
                <p><strong>Status:</strong> {appointment.status}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminRoute>
  );
}