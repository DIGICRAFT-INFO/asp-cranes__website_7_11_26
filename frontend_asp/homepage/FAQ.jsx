"use client";
import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch FAQ data from API
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const jsonResponse = await apiFetch("/faqs");

        // Filter active FAQs or just set the array from data
        if (jsonResponse.success && Array.isArray(jsonResponse.data)) {
          setFaqs(jsonResponse.data);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-24 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-20 left-0 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Enhanced Heading */}
        <div className="text-center mb-16">
          <div className="inline-block">
            <p className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3">
              Got Questions?
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked <span className="text-red-600">Questions</span>
            </h2>
          </div>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg">
            Find answers to common questions about our services and operations
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-2 text-gray-500">Loading questions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-10 bg-red-50 border border-red-200 rounded-2xl p-6">
            <p className="text-red-600 font-medium">Oops! Something went wrong.</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        )}

        {/* Dynamic FAQ Items */}
        {!isLoading && !error && (
          <div className="space-y-5">
            {faqs.map((faq, index) => (
              <div
                key={faq._id || index}
                className={`group border-2 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
                  activeIndex === index
                    ? "border-black shadow-lg"
                    : "border-gray-100 hover:border-blue-200"
                }`}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-6 text-left group-hover:bg-blue-50/50 transition-colors duration-300"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Question Number Badge */}
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        activeIndex === index
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-red-600"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <span
                      className={`font-semibold text-lg transition-colors duration-300 ${
                        activeIndex === index ? "text-red-600" : "text-gray-800"
                      }`}
                    >
                      {faq.question}
                    </span>
                  </div>

                  {/* Animated Plus/Minus Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      activeIndex === index
                        ? "bg-red-600 text-white rotate-180"
                        : "bg-gray-100 text-red-500 group-hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Animated Answer */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    activeIndex === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 pt-2">
                    <div className="pl-12 pr-4">
                      <div className="h-px w-full bg-gradient-to-r from-blue-200 to-transparent mb-4"></div>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}