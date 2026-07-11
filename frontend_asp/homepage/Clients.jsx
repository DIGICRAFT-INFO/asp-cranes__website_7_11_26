"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function OurClients() {
  const [clients, setClients] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch active clients/partners managed by the admin panel
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const json = await apiFetch("/clients");
        if (json.success && Array.isArray(json.data)) {
          setClients(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Don't render the section at all if there's nothing to show yet
  if (!loading && clients.length === 0) return null;

  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white py-24 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Enhanced Heading */}
        <div className="text-center mb-16">
          <div className="inline-block">
            <p className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">
              Trusted Partners
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-red-600">Clients</span>
            </h2>
          </div>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg">
            Partnering with industry leaders to deliver excellence across
            sectors
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-10 text-gray-400 animate-pulse">
            Loading partners...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {clients.map((client, index) => {
              const logoEl = (
                <div
                  className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`,
                  }}
                >
                  {/* Gradient Border on Hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-orange-500/0 group-hover:from-blue-500/10 group-hover:to-orange-500/10 transition-all duration-300"></div>

                  {/* Logo Container */}
                  <div className="relative flex items-center justify-center h-16">
                    <Image
                      src={client.logo || "https://via.placeholder.com/160x80?text=" + encodeURIComponent(client.name)}
                      alt={client.name}
                      fill
                      className="max-h-12 max-w-full object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>
              );

              // If the client has a website, wrap the card in a link
              return client.website ? (
                <a
                  key={client._id || index}
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {logoEl}
                </a>
              ) : (
                <React.Fragment key={client._id || index}>{logoEl}</React.Fragment>
              );
            })}
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
      `}</style>
    </section>
  );
}
