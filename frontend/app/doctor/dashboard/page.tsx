"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DoctorSidebar from "@/components/DoctorSidebar";

const cards = [
  {
    title: "Manage Profile",
    desc: "Create and update your doctor profile details.",
    href: "/doctor/profile",
  },
  {
    title: "Set Availability",
    desc: "Manage consultation dates and time slots.",
    href: "/doctor/availability",
  },
  {
    title: "Appointments",
    desc: "View and manage patient appointment requests.",
    href: "/doctor/appointments",
  },
  {
  title: "Telemedicine Sessions",
  desc: "Manage and join your online consultation sessions.",
  href: "/telemedicine/doctor",
 },
 {
  title: "Notifications",
  desc: "View SMS and email notification history.",
  href: "/doctor/notifications",
 }
];

export default function DoctorDashboard() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <DoctorSidebar />

        <section>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Doctor Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Manage your professional profile, availability, and appointments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="rounded-3xl bg-white border shadow-sm p-6 hover:shadow-md transition"
              >
                <h2 className="text-xl font-semibold text-slate-900">{card.title}</h2>
                <p className="text-slate-600 mt-2">{card.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}