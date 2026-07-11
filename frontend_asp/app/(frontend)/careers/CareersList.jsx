"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Briefcase, Clock, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function CareersList() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiFetch("/careers")
      .then((json) => {
        if (mounted) setCareers(json.data || []);
      })
      .catch(() => mounted && setError(true))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24 text-gray-500">
        Couldn&apos;t load job openings right now. Please check back shortly.
      </div>
    );
  }

  if (careers.length === 0) {
    return (
      <div className="text-center py-24 max-w-xl mx-auto">
        <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">No open positions right now</h3>
        <p className="text-gray-500 mb-6">
          We&apos;re not actively hiring at the moment, but we&apos;re always glad to hear from
          skilled operators, technicians, and engineers. Send us your resume and we&apos;ll
          reach out when a role opens up.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-lg transition"
        >
          Get In Touch
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <div className="grid gap-6">
        {careers.map((job) => (
          <div
            key={job._id}
            className="border border-gray-200 rounded-2xl p-6 md:p-8 hover:border-red-300 hover:shadow-lg transition-all bg-white"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
                  {job.department}
                </span>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{job.title}</h3>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" /> {job.employmentType}
                  </span>
                  {job.experience && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {job.experience}
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/contact?subject=${encodeURIComponent(job.title)}`}
                className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg text-center transition"
              >
                Apply Now
              </Link>
            </div>

            {job.description && <p className="text-gray-600 mt-5 leading-relaxed">{job.description}</p>}

            {job.requirements?.length > 0 && (
              <div className="mt-5">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">
                  Requirements
                </h4>
                <ul className="space-y-1.5">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
