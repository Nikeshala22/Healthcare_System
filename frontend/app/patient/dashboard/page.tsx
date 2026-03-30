"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PatientSidebar from "@/components/PatientSidebar";

const cards = [
  {
    title: "Manage Profile",
    desc: "Update your personal and medical profile details.",
    href: "/patient/profile",
  },
  {
    title: "Medical Reports",
    desc: "Upload and view your medical reports.",
    href: "/patient/reports",
  },
  {
    title: "Prescriptions",
    desc: "View your prescriptions issued by doctors.",
    href: "/patient/prescriptions",
  },
  {
    title: "Search Doctors",
    desc: "Find doctors by specialty and book appointments.",
    href: "/appointments/search",
  },
  {
    title: "My Appointments",
    desc: "View and manage your booked appointments.",
    href: "/appointments/my",
  },
  {
  title: "Telemedicine Sessions",
  desc: "Join your scheduled online consultations.",
  href: "/telemedicine/patient",
},
{
  title: "Payments",
  desc: "View your consultation payment history.",
  href: "/patient/payments",
},
{
  title: "Notifications",
  desc: "View SMS and email notification history.",
  href: "/patient/notifications",
}
];

export default function PatientDashboard() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <PatientSidebar />

        <section>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Patient Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Manage your records, reports, and prescriptions from one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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