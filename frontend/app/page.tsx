import Link from "next/link";

export default function HomePage() {
  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
      <div className="max-w-4xl text-center">
        <div className="inline-block rounded-full bg-indigo-100 px-4 py-2 text-indigo-700 font-medium mb-6">
          AI-Enabled Smart Healthcare Platform
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
          Book appointments, manage records, and access telemedicine with ease
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          A modern healthcare platform for patients, doctors, and administrators
          to manage appointments, reports, and consultations securely.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-2xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-slate-800 font-semibold hover:bg-slate-50 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </section>
  );
}