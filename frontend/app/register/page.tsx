"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_URL } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${AUTH_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      setMessage("Registration successful");
      setTimeout(() => router.push("/login"), 1000);
    } catch {
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl border p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
        <p className="text-slate-500 mb-6">Register as patient or doctor</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3"
          />

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

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>

          <button
            type="submit"
            className="w-full rounded-2xl bg-indigo-600 py-3 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Register
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}