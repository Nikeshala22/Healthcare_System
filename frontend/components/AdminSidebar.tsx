"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Users", href: "/admin/users" },
  { name: "Appointments", href: "/admin/appointments" },
  { name: "Payments", href: "/admin/payments" },
  { name: "Notifications", href: "/admin/notifications" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-3xl bg-white border shadow-sm p-6 h-fit">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Admin Panel</h2>

      <nav className="space-y-3">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}