"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight, ChevronDown, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import cta3 from "@/public/homepage/cta3.jpg";
import { apiFetch } from "@/lib/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiry: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  // If arriving from a link like "Inquire About This Asset" (/contact?crane=Tower+Crane)
  // or "Apply Now" on a careers listing (/contact?subject=Crane+Operator), pre-fill the
  // message so the visitor doesn't have to retype what they're asking about.
  // Read from window.location directly (instead of useSearchParams) so this component
  // doesn't need a Suspense boundary wherever it's used.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const topic = params.get("crane") || params.get("subject");
    if (topic) {
      setFormData((prev) => ({
        ...prev,
        inquiry: prev.inquiry || "Heavy Cranes",
        message: prev.message || `I'm interested in: ${topic}. Please share more details.`,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", inquiry: "", message: "" });
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <section className="relative w-full flex items-center bg-white overflow-hidden min-h-[100vh] md:min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={cta3}
          fill
          priority
          alt="Construction worker"
          className="object-cover object-top"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/30 via-white/90 to-white md:from-transparent md:via-white/60 md:to-white" />
      </div>

      {/* Form Wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 flex justify-center md:justify-end">
        <div className="w-full max-w-xl bg-white/95 md:bg-transparent p-6 sm:p-8 rounded-xl md:rounded-none shadow-lg md:shadow-none">
          
          {/* Header */}
          <div className="mb-8">
            <button type="button" className="flex items-center text-red-600 font-bold text-xs tracking-widest uppercase mb-4 group">
              Get Free Quote
              <ArrowUpRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Have a project in mind?
            </h2>
          </div>

          {/* Success State */}
          {status === "success" ? (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg p-6">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Thank you!</p>
                <p className="text-sm">We&apos;ve received your message and will get back to you soon.</p>
              </div>
            </div>
          ) : (
            /* Form */
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  className="w-full p-4 bg-gray-100 focus:ring-2 focus:ring-red-500 outline-none text-gray-700"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className="w-full p-4 bg-gray-100 focus:ring-2 focus:ring-red-500 outline-none text-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full p-4 bg-gray-100 focus:ring-2 focus:ring-red-500 outline-none text-gray-700"
                />

                <div className="relative">
                  <select
                    name="inquiry"
                    value={formData.inquiry}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-100 focus:ring-2 focus:ring-red-500 outline-none text-gray-500 appearance-none cursor-pointer"
                  >
                    <option value="">Your Inquiry</option>
                    <option value="Construction">Construction</option>
                    <option value="Heavy Cranes">Heavy Cranes</option>
                    <option value="Consulting">Consulting</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Message..."
                rows={5}
                required
                className="w-full p-4 bg-gray-100 focus:ring-2 focus:ring-red-500 outline-none text-gray-700 resize-none"
              />

              {status === "error" && (
                <p className="text-red-600 text-sm font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-red-600 hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-5 px-8 flex items-center justify-center uppercase tracking-widest text-sm transition-colors group"
              >
                {status === "submitting" ? (
                  <>
                    Submitting...
                    <Loader2 className="ml-2 w-5 h-5 animate-spin" />
                  </>
                ) : (
                  <>
                    Submit Now
                    <ArrowUpRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
