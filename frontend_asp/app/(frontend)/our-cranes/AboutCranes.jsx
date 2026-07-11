"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const typeOfWorkOptions = ["General Construction", "Erection (Tower)", "Loading/Unloading", "Material Handling", "Concrete Pouring", "Other"];
const durationOptions = ["1-7 Days", "1 Month", "2 Months", "3 Months", "4-6 Months", "6+ Months (Long Term)"];

const CATEGORY_LABELS = {
  tower: "Tower Cranes",
  "truck-mounted": "Truck-Mounted Cranes",
  crawler: "Crawler Cranes",
  "pick-carry": "Pick & Carry Cranes",
  awp: "Aerial Work Platforms",
  trailer: "Multi-Axle Trailers",
  other: "Other",
};

export default function Cranes() {
  const [cranes, setCranes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const [openId, setOpenId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [selectedCrane, setSelectedCrane] = useState("");
  const [quoteStatus, setQuoteStatus] = useState("idle"); // idle | submitting | success | error
  const [quoteError, setQuoteError] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    contactNumber: "",
    designation: "",
    typeOfWork: "",
    location: "",
    startDate: "",
    noOfShifts: "1",
    shiftHours: "8hrs",
    duration: "",
    modelType: "",
    reqCapacity: "",
    loadWeight: "",
    reqRadius: "",
    maxHeight: "",
  });

  // Fetch Cranes from Backend API
  useEffect(() => {
    const fetchCranes = async () => {
      try {
        const json = await apiFetch("/cranes");
        if (json.success) {
          setCranes(json.data);
        } else {
          throw new Error(json.message || "Something went wrong");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCranes();
  }, []);

  // Read ?category=tower (etc) from the URL so footer/other links can deep-link
  // straight into a filtered view, e.g. /our-cranes?category=tower
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat && CATEGORY_LABELS[cat]) setActiveCategory(cat);
  }, []);

  const availableCategories = useMemo(
    () => Array.from(new Set(cranes.map((c) => c.category).filter(Boolean))),
    [cranes]
  );

  const filteredCranes = useMemo(
    () => (activeCategory === "All" ? cranes : cranes.filter((c) => c.category === activeCategory)),
    [cranes, activeCategory]
  );

  const selectCategory = (cat) => {
    setActiveCategory(cat);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (cat === "All") url.searchParams.delete("category");
    else url.searchParams.set("category", cat);
    window.history.replaceState({}, "", url);
  };

  const toggle = (id) => setOpenId(openId === id ? null : id);

  const openQuoteForm = (craneName) => {
    setSelectedCrane(craneName);
    setIsModalOpen(true);
    setShowMore(false);
    setQuoteStatus("idle");
    setQuoteError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setQuoteStatus("submitting");
    setQuoteError("");

    // The backend only exposes a generic /contact endpoint, so the detailed
    // quote fields are folded into a single structured message rather than
    // silently discarded (as the previous version did with console.log/alert).
    const lines = [
      `Quote request for: ${selectedCrane}`,
      `Company: ${formData.companyName}`,
      `Designation: ${formData.designation || "-"}`,
      formData.typeOfWork && `Type of Work: ${formData.typeOfWork}`,
      formData.location && `Project Location: ${formData.location}`,
      formData.startDate && `Start Date: ${formData.startDate}`,
      `Shifts: ${formData.noOfShifts} x ${formData.shiftHours}`,
      formData.duration && `Rental Duration: ${formData.duration}`,
      formData.modelType && `Model/Type Preference: ${formData.modelType}`,
      formData.reqCapacity && `Required Capacity: ${formData.reqCapacity} MT`,
      formData.loadWeight && `Max Load Weight: ${formData.loadWeight} MT`,
      formData.reqRadius && `Working Radius: ${formData.reqRadius} m`,
      formData.maxHeight && `Max Lifting Height: ${formData.maxHeight} m`,
    ].filter(Boolean);

    try {
      const res = await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({
          name: formData.contactPerson,
          email: formData.companyName ? `${formData.companyName.replace(/\s+/g, ".").toLowerCase()}@quote-request.local` : "quote@quote-request.local",
          phone: formData.contactNumber,
          inquiry: "Heavy Cranes",
          message: lines.join("\n"),
        }),
      });

      if (res.success) {
        setQuoteStatus("success");
      }
    } catch (err) {
      setQuoteStatus("error");
      setQuoteError(err.message || "Something went wrong. Please try again or call us directly.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-4">
        <p className="text-red-500 font-bold text-lg">Error: {error}</p>
        <p className="text-gray-500 text-sm mt-1">Please ensure your backend server is running on port 5000.</p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 font-sans">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 border-l-4 border-red-500 pl-4">Our Fleet</h2>

      {availableCategories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => selectCategory("All")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition ${
              activeCategory === "All" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition ${
                activeCategory === cat ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {filteredCranes.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No cranes found in this category yet.</p>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCranes.map((crane) => (
          <div key={crane._id} className="group border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl bg-white overflow-hidden flex flex-col transition-all duration-300 transform hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative h-56 bg-gray-200 overflow-hidden">
              <Image 
                src={crane.image || "https://images.unsplash.com/photo-1504307651254-35680f356dfd"} 
                alt={crane.name} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              {crane.badge && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                  {crane.badge}
                </div>
              )}
            </div>

            {/* Content Container */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-2">
                <span className="text-[11px] font-extrabold text-red-500 uppercase tracking-wider">{crane.category}</span>
                <h3 className="font-bold text-xl text-gray-900 mt-0.5">{crane.name}</h3>
                {crane.subtitle && <p className="text-xs text-gray-400 italic font-medium">{crane.subtitle}</p>}
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-grow">
                {crane.description || `High-performance machine with a maximum lifting capacity of ${crane.capacityLabel || crane.specs['Lifting Capacity'] || crane.specs['Max Lifting Capacity'] || 'N/A'}.`}
              </p>

              {/* Specification Toggle */}
              <button 
                onClick={() => toggle(crane._id)} 
                className="text-red-500 text-xs font-bold mb-4 text-left hover:text-red-700 flex items-center gap-1 transition"
              >
                {openId === crane._id ? "✕ Hide Specs" : "→ View Key Specs"}
              </button>

              {openId === crane._id && crane.specs && (
                <ul className="bg-gray-50 p-4 rounded-xl mb-4 text-sm space-y-2 border border-gray-100 animate-in fade-in slide-in-from-top-1 duration-300">
                  {Object.entries(crane.specs).map(([key, val]) => (
                    <li key={key} className="flex justify-between border-b border-gray-200/50 last:border-0 pb-1">
                      <span className="text-gray-500 text-xs">{key}</span>
                      <span className="font-semibold text-gray-800 text-xs">{val}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Action Buttons */}
              <div className="mt-auto flex gap-3">
                <button 
                  onClick={() => openQuoteForm(crane.name)} 
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-red-700 active:scale-95 transition shadow-md shadow-red-200"
                >
                  Get Quote
                </button>
                
                <Link 
                  href={`/our-cranes/${crane.slug}`} 
                  className="flex-1 border-2 border-red-600 text-red-600 py-3 rounded-lg text-sm font-bold text-center hover:bg-red-50 active:scale-95 transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* --- QUOTE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md transition-all">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-20">
              <div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Request Quote</h3>
                <p className="text-sm text-red-600 font-bold">{selectedCrane}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {quoteStatus === "success" ? (
              <div className="p-10 flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl">✓</div>
                <h4 className="text-xl font-black text-gray-900">Quote Request Sent!</h4>
                <p className="text-gray-500 text-sm max-w-sm">
                  Thanks — our team will review your requirements for the {selectedCrane} and get back to you shortly.
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            ) : (
            <>
            {/* Scrollable Form Body */}
            <div className="overflow-y-auto flex-1 p-6 lg:p-8">
              <form id="quote-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Company Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Company Name *</label>
                      <input type="text" name="companyName" onChange={handleInputChange} required className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-500 bg-gray-50/50 transition" placeholder="Muraad Construction" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Contact Person *</label>
                      <input type="text" name="contactPerson" onChange={handleInputChange} required className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-500 bg-gray-50/50 transition" placeholder="John Doe" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Contact Number *</label>
                      <input type="tel" name="contactNumber" onChange={handleInputChange} required className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-500 bg-gray-50/50 transition" placeholder="+91 00000 00000" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Designation</label>
                      <input type="text" name="designation" onChange={handleInputChange} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-500 bg-gray-50/50 transition" placeholder="Project Manager" />
                    </div>
                  </div>
                </div>

                {!showMore ? (
                  <button 
                    type="button" 
                    onClick={() => setShowMore(true)}
                    className="group w-full py-4 border-2 border-dashed hover:border-gray-300 hover:text-gray-500 font-bold rounded-xl border-red-500 text-red-600 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-xl group-hover:rotate-90 transition-transform">+</span>
                    Add Technical & Site Details (Recommended)
                  </button>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Site & Machine Specs</h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Specific Model/Type Preference</label>
                      <input type="text" name="modelType" onChange={handleInputChange} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-500 bg-gray-50/50 transition" placeholder="e.g. Luffing Jib, Next-Gen" />
                    </div>

                    <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-red-600 uppercase">Req. Capacity (MT)</label>
                          <input type="text" name="reqCapacity" onChange={handleInputChange} className="w-full border-2 border-white p-2.5 rounded-lg shadow-sm" placeholder="e.g. 50" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-blue-600 uppercase">Max Load Weight (MT)</label>
                          <input type="text" name="loadWeight" onChange={handleInputChange} className="w-full border-2 border-white p-2.5 rounded-lg shadow-sm" placeholder="e.g. 40" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-600 uppercase">Working Radius (Mtr)</label>
                          <input type="text" name="reqRadius" onChange={handleInputChange} className="w-full border-2 border-white p-2.5 rounded-lg shadow-sm" placeholder="e.g. 30" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-600 uppercase">Max Lifting Height (Mtr)</label>
                          <input type="text" name="maxHeight" onChange={handleInputChange} className="w-full border-2 border-white p-2.5 rounded-lg shadow-sm" placeholder="e.g. 60" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Work Environment</label>
                        <select name="typeOfWork" onChange={handleInputChange} className="w-full border-2 border-gray-100 p-3 rounded-xl bg-white outline-none focus:border-red-500 transition">
                          <option value="">Select Work Type</option>
                          {typeOfWorkOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Project Location</label>
                        <input type="text" name="location" onChange={handleInputChange} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-500 transition" placeholder="City / Site Address" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Work Shifts</label>
                        <input type="number" name="noOfShifts" onChange={handleInputChange} defaultValue="1" className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-500 transition" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Shift Duration</label>
                        <input type="text" name="shiftHours" onChange={handleInputChange} placeholder="e.g. 8hrs or 12hrs" className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-red-500 transition" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Rental Duration</label>
                      <select name="duration" onChange={handleInputChange} className="w-full border-2 border-gray-100 p-3 rounded-xl bg-white outline-none focus:border-red-500 transition">
                        <option value="">Select Duration</option>
                        {durationOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer Submit Button */}
            <div className="p-6 border-t bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-30">
              {quoteStatus === "error" && (
                <p className="text-red-600 text-sm font-semibold mb-3">{quoteError}</p>
              )}
              <button
                type="submit"
                form="quote-form"
                disabled={quoteStatus === "submitting"}
                className="w-full hover:bg-gray-900 text-white font-black py-4 rounded-lg bg-red-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {quoteStatus === "submitting" ? "SUBMITTING..." : "SUBMIT QUOTE REQUEST"}
                <span className="text-xl">→</span>
              </button>
            </div>
            </>
            )}
          </div>
        </div>
      )}
    </section>
  );
} 