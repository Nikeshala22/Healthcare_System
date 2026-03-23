"use client";

import { useEffect, useState } from "react";
import { PATIENT_URL, getAuthHeaders } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import PatientSidebar from "@/components/PatientSidebar";

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  address: string;
  bloodGroup: string;
  emergencyContact: string;
};

export default function PatientProfilePage() {
  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    email: "",
    phone: "",
    age: 0,
    gender: "",
    address: "",
    bloodGroup: "",
    emergencyContact: "",
  });

  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    try {
      const res = await fetch(`${PATIENT_URL}/api/patient/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({
          fullName: data.profile.fullName || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          age: data.profile.age || 0,
          gender: data.profile.gender || "",
          address: data.profile.address || "",
          bloodGroup: data.profile.bloodGroup || "",
          emergencyContact: data.profile.emergencyContact || "",
        });
        setMessage("");
      } else {
        setMessage(data.message || "Failed to load profile");
      }
    } catch {
      setMessage("Could not connect to patient service");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`${PATIENT_URL}/api/patient/profile`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setMessage(data.message);
      if (res.ok) loadProfile();
    } catch {
      setMessage("Could not connect to patient service");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${PATIENT_URL}/api/patient/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setMessage(data.message);
      if (res.ok) loadProfile();
    } catch {
      setMessage("Could not connect to patient service");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <PatientSidebar />

        <section className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Patient Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="rounded-2xl border px-4 py-3" type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3" type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3" type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3" type="text" name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3" type="text" name="bloodGroup" placeholder="Blood Group" value={form.bloodGroup} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3 md:col-span-2" type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3 md:col-span-2" type="text" name="emergencyContact" placeholder="Emergency Contact" value={form.emergencyContact} onChange={handleChange} />
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={handleCreate} className="rounded-2xl bg-indigo-600 px-5 py-3 text-white font-semibold hover:bg-indigo-700 transition">
              Create Profile
            </button>
            <button onClick={handleUpdate} className="rounded-2xl bg-slate-900 px-5 py-3 text-white font-semibold hover:bg-slate-800 transition">
              Update Profile
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}