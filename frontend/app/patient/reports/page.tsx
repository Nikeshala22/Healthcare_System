"use client";

import { useEffect, useRef, useState, DragEvent, ChangeEvent } from "react";
import { PATIENT_URL, getAuthHeaders } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import PatientSidebar from "@/components/PatientSidebar";

type Report = {
  title: string;
  fileUrl: string;
  uploadedAt: string;
  originalName?: string;
};

export default function ReportsPage() {
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getUploadHeaders = () => {
    const headers = getAuthHeaders() as Record<string, string>;
    const uploadHeaders: Record<string, string> = {};

    if (headers.Authorization) {
      uploadHeaders.Authorization = headers.Authorization;
    }

    if (headers.authorization) {
      uploadHeaders.authorization = headers.authorization;
    }

    return uploadHeaders;
  };

  const buildFileUrl = (fileUrl: string) => {
    if (!fileUrl) return "#";
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }
    return `${PATIENT_URL}${fileUrl}`;
  };

  const validatePdf = (file: File) => {
    if (file.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage("PDF size must be less than 5MB.");
      return false;
    }

    return true;
  };

  const handleSelectedFile = (file: File | null) => {
    if (!file) return;

    if (!validatePdf(file)) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setMessage("");
  };

  const loadReports = async () => {
    try {
      const res = await fetch(`${PATIENT_URL}/api/patient/reports`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        setReports(data.reports || []);
      } else {
        setMessage(data.message || "Failed to load reports");
      }
    } catch {
      setMessage("Could not connect to patient service");
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const uploadReport = async () => {
    if (!title.trim()) {
      setMessage("Please enter report title.");
      return;
    }

    if (!selectedFile) {
      setMessage("Please select a PDF file.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("file", selectedFile);

      const res = await fetch(`${PATIENT_URL}/api/patient/reports`, {
        method: "POST",
        headers: getUploadHeaders(),
        body: formData,
      });

      const data = await res.json();
      setMessage(data.message || "Upload completed");

      if (res.ok) {
        setTitle("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        loadReports();
      }
    } catch {
      setMessage("Could not connect to patient service");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleSelectedFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0] || null;
    handleSelectedFile(file);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <PatientSidebar />

        <section className="space-y-6">
          <div className="rounded-3xl bg-white border shadow-sm p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Medical Reports
            </h1>

            <div className="grid gap-4">
              <input
                type="text"
                placeholder="Report Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-300 bg-slate-50"
                }`}
              >
                <p className="text-slate-700 font-medium">
                  Drag and drop your medical report PDF here
                </p>
                <p className="text-sm text-slate-500 mt-2">or</p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-white font-semibold hover:bg-slate-800 transition"
                >
                  Choose PDF File
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile && (
                  <div className="mt-4 rounded-2xl border bg-white px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-4">
                  PDF only, maximum 5MB
                </p>
              </div>

              <button
                onClick={uploadReport}
                disabled={loading}
                className="w-fit rounded-2xl bg-indigo-600 px-5 py-3 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Uploading..." : "Upload Report"}
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
                    className="rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {report.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {new Date(report.uploadedAt).toLocaleString()}
                      </p>
                      {report.originalName && (
                        <p className="text-sm text-slate-500 mt-1">
                          File: {report.originalName}
                        </p>
                      )}
                    </div>

                    <a
                      href={buildFileUrl(report.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-slate-900 px-4 py-2 text-white text-sm text-center"
                    >
                      View PDF
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