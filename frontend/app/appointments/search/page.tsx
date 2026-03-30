"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DOCTOR_URL, getAuthHeaders } from "@/lib/api";

type Doctor = {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  specialty: string;
  hospital: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  availability?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
};

export default function SearchDoctorsPage() {
  const [specialty, setSpecialty] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAllDoctors = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${DOCTOR_URL}/api/doctor/all`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        setDoctors(data.doctors || []);
      } else {
        setDoctors([]);
        setMessage(data.message || "Failed to load doctors");
      }
    } catch (error) {
      console.error("Load doctors error:", error);
      setDoctors([]);
      setMessage("Could not connect to doctor service");
    } finally {
      setLoading(false);
    }
  };

  const searchDoctors = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (!specialty.trim()) {
        await loadAllDoctors();
        return;
      }

      const res = await fetch(
        `${DOCTOR_URL}/api/doctor/search?specialty=${encodeURIComponent(
          specialty
        )}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setDoctors(data.doctors || []);
      } else {
        setDoctors([]);
        setMessage(data.message || "Search failed");
      }
    } catch (error) {
      console.error("Search doctors error:", error);
      setDoctors([]);
      setMessage("Could not connect to doctor service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllDoctors();
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="rounded-3xl bg-white border shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Available Doctors
          </h1>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              className="flex-1 rounded-2xl border px-4 py-3"
              placeholder="Search by specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />

            <button
              onClick={searchDoctors}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-white font-semibold"
            >
              Search
            </button>

            <button
              onClick={() => {
                setSpecialty("");
                loadAllDoctors();
              }}
              className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700"
            >
              Show All
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}

          {loading && (
            <p className="mt-4 text-slate-500">Loading doctors...</p>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {!loading && doctors.length === 0 ? (
              <p className="text-slate-500">No doctors found.</p>
            ) : (
              doctors.map((doctor) => (
                <div
                  key={doctor.userId}
                  className="rounded-2xl border p-5 shadow-sm hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {doctor.fullName}
                  </h3>

                  <p className="text-slate-600 mt-2">
                    <strong>Specialty:</strong> {doctor.specialty}
                  </p>
                  <p className="text-slate-600">
                    <strong>Hospital:</strong> {doctor.hospital || "N/A"}
                  </p>
                  <p className="text-slate-600">
                    <strong>Qualification:</strong>{" "}
                    {doctor.qualification || "N/A"}
                  </p>
                  <p className="text-slate-600">
                    <strong>Experience:</strong> {doctor.experience || 0} years
                  </p>
                  <p className="text-slate-600">
                    <strong>Fee:</strong> Rs. {doctor.consultationFee || 0}
                  </p>

                  {doctor.availability && doctor.availability.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium text-slate-800 mb-2">
                        Availability:
                      </p>
                      <div className="space-y-1">
                        {doctor.availability.map((slot, index) => (
                          <p key={index} className="text-sm text-slate-600">
                            {slot.day}: {slot.startTime} - {slot.endTime}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/appointments/book?doctorId=${doctor.userId}&doctorName=${encodeURIComponent(
                      doctor.fullName
                    )}&specialty=${encodeURIComponent(
                      doctor.specialty
                    )}&consultationFee=${doctor.consultationFee}&doctorEmail=${encodeURIComponent(
                      doctor.email
                    )}&doctorPhone=${encodeURIComponent(doctor.phone || "")}`}
                    className="inline-block mt-4 rounded-xl bg-slate-900 px-4 py-2 text-white text-sm"
                  >
                    Book Appointment
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}