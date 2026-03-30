"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Dashboard", href: "/doctor/dashboard" },
  { name: "Profile", href: "/doctor/profile" },
  { name: "Availability", href: "/doctor/availability" },
  { name: "Appointments", href: "/doctor/appointments" },
  { name: "Notifications", href: "/doctor/notifications" },
];

export default function DoctorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 rounded-2xl bg-white shadow-sm border p-4 h-fit">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Doctor Panel</h2>

      <div className="flex flex-col gap-2">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}