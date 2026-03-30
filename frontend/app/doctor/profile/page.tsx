"use client";

import { useEffect, useState } from "react";
import { DOCTOR_URL, getAuthHeaders } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import DoctorSidebar from "@/components/DoctorSidebar";

type DoctorProfile = {
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  qualification: string;
  hospital: string;
  experience: number;
  bio: string;
  consultationFee: number;
};

export default function DoctorProfilePage() {
  const [form, setForm] = useState<DoctorProfile>({
    fullName: "",
    email: "",
    phone: "",
    specialty: "",
    qualification: "",
    hospital: "",
    experience: 0,
    bio: "",
    consultationFee: 0,
  });

  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    try {
      const res = await fetch(`${DOCTOR_URL}/api/doctor/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({
          fullName: data.profile.fullName || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          specialty: data.profile.specialty || "",
          qualification: data.profile.qualification || "",
          hospital: data.profile.hospital || "",
          experience: data.profile.experience || 0,
          bio: data.profile.bio || "",
          consultationFee: data.profile.consultationFee || 0,
        });
        setMessage("");
      } else {
        setMessage(data.message || "Failed to load profile");
      }
    } catch {
      setMessage("Could not connect to doctor service");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "experience" || name === "consultationFee"
          ? Number(value)
          : value,
    }));
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`${DOCTOR_URL}/api/doctor/profile`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setMessage(data.message);
      if (res.ok) loadProfile();
    } catch {
      setMessage("Could not connect to doctor service");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${DOCTOR_URL}/api/doctor/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setMessage(data.message);
      if (res.ok) loadProfile();
    } catch {
      setMessage("Could not connect to doctor service");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <DoctorSidebar />

        <section className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Doctor Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="rounded-2xl border px-4 py-3" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3" name="specialty" placeholder="Specialty" value={form.specialty} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3" name="qualification" placeholder="Qualification" value={form.qualification} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3" name="hospital" placeholder="Hospital" value={form.hospital} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3" type="number" name="experience" placeholder="Experience" value={form.experience} onChange={handleChange} />
            <input className="rounded-2xl border px-4 py-3" type="number" name="consultationFee" placeholder="Consultation Fee" value={form.consultationFee} onChange={handleChange} />
            <textarea className="rounded-2xl border px-4 py-3 md:col-span-2" name="bio" placeholder="Bio" value={form.bio} onChange={handleChange} rows={4} />
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