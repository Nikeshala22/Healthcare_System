"use client";

import { useEffect, useState } from "react";
import { PATIENT_URL, getAuthHeaders } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import PatientSidebar from "@/components/PatientSidebar";

type Report = {
  title: string;
  fileUrl: string;
  uploadedAt: string;
};

export default function ReportsPage() {
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState("");

  const loadReports = async () => {
    try {
      const res = await fetch(`${PATIENT_URL}/api/patient/reports`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) setReports(data.reports || []);
      else setMessage(data.message || "Failed to load reports");
    } catch {
      setMessage("Could not connect to patient service");
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const uploadReport = async () => {
    try {
      const res = await fetch(`${PATIENT_URL}/api/patient/reports`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, fileUrl }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setTitle("");
        setFileUrl("");
        loadReports();
      }
    } catch {
      setMessage("Could not connect to patient service");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <PatientSidebar />

        <section className="space-y-6">
          <div className="rounded-3xl bg-white border shadow-sm p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Medical Reports</h1>

            <div className="grid gap-4">
              <input
                type="text"
                placeholder="Report Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-2xl border px-4 py-3"
              />

              <input
                type="text"
                placeholder="File URL"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="rounded-2xl border px-4 py-3"
              />

              <button
                onClick={uploadReport}
                className="w-fit rounded-2xl bg-indigo-600 px-5 py-3 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Upload Report
              </button>
            </div>

            {message && (
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {message}
              </p>
            )}
          </div>

          <div className="rounded-3xl bg-white border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Uploaded Reports</h2>

            <div className="space-y-4">
              {reports.length === 0 ? (
                <p className="text-slate-500">No reports uploaded yet.</p>
              ) : (
                reports.map((report, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">{report.title}</h3>
                      <p className="text-sm text-slate-500">
                        {new Date(report.uploadedAt).toLocaleString()}
                      </p>
                    </div>

                    <a
                      href={report.fileUrl}
                      target="_blank"
                      className="rounded-xl bg-slate-900 px-4 py-2 text-white text-sm"
                    >
                      View File
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}