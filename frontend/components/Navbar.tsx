"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="w-full border-b bg-white/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          HealthCare+
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link href="/">Home</Link>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
          <button
            onClick={logout}
            className="rounded-xl bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}