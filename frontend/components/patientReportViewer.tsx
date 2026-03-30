"use client";

import { useEffect, useState } from "react";
import { PATIENT_URL, getAuthHeaders } from "@/lib/api";

type Report = {
  title: string;
  fileUrl: string;
  uploadedAt: string;
  originalName?: string;
};

type Props = {
  patientId: string;
};

export default function PatientReportsViewer({ patientId }: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState("");

  const buildFileUrl = (fileUrl: string) => {
    if (!fileUrl) return "#";
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }
    return `${PATIENT_URL}${fileUrl}`;
  };

  const loadReports = async () => {
    try {
      const res = await fetch(`${PATIENT_URL}/api/patient/reports/${patientId}`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        setReports(data.reports || []);
        setMessage("");
      } else {
        setMessage(data.message || "Failed to load reports");
      }
    } catch {
      setMessage("Could not connect to patient service");
    }
  };

  useEffect(() => {
    if (patientId) {
      loadReports();
    }
  }, [patientId]);

  return (
    <div className="mt-4 rounded-2xl border p-4 bg-slate-50">
      <h3 className="text-lg font-semibold text-slate-900 mb-3">
        Patient Medical Reports
      </h3>

      {message && <p className="text-sm text-slate-700 mb-3">{message}</p>}

      <div className="space-y-3">
        {reports.length === 0 ? (
          <p className="text-slate-500">No medical reports found.</p>
        ) : (
          reports.map((report, index) => (
            <div key={index} className="rounded-xl border bg-white p-3">
              <p><strong>Title:</strong> {report.title}</p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(report.uploadedAt).toLocaleString()}
              </p>
              {report.originalName && (
                <p><strong>File:</strong> {report.originalName}</p>
              )}

              <a
                href={buildFileUrl(report.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-indigo-600 underline"
              >
                View PDF
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}