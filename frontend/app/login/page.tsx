"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${AUTH_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "patient") router.push("/patient/dashboard");
      else if (data.user.role === "doctor") router.push("/doctor/dashboard");
      else router.push("/admin/dashboard");
    } catch {
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl border p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-slate-500 mb-6">Login to continue to your dashboard</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3"
          />

          <button
            type="submit"
            className="w-full rounded-2xl bg-indigo-600 py-3 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}