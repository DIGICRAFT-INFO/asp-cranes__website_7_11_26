"use client"

import React, { useState, useEffect } from "react";
import { HardHat, Ruler, Construction, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

const GeneralConstruction = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const result = await apiFetch("/services");

        if (result.success) {
          setServices(result.data);
        } else {
          throw new Error("API responded with success: false");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Helper function to return a Lucide icon based on the title or database 'icon' field
  const getIcon = (title) => {
    const iconClass = "w-10 h-10 text-orange-600";
    
    switch (title) {
      case "Shifting & Loading":
        return <Construction className={iconClass} />;
      case "Winch Handling":
        return <Ruler className={iconClass} />;
      case "Material Handling":
      case "Jacking (Machine Jacking & Leveling)":
      case "Operations & Maintenance (O&M)":
      default:
        return <HardHat className={iconClass} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600 font-medium">
        Error loading services: {error}
      </div>
    );
  }

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto font-sans">
      {/* Header Section */}
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          The services we provide
        </h2>
        <p className="text-gray-500 leading-relaxed max-w-5xl text-sm md:text-base">
          We deliver heavy industrial setups, equipment alignments, and field maintenance with over 7 years of specialized expertise.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service._id}
            className="bg-[#F9FAFB] p-8 flex items-start gap-4 transition-all hover:shadow-md group"
          >
            {/* Icon Wrapper with circle background */}
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-2 bg-red-100 rounded-full opacity-50 scale-110"></div>
              <div className="relative">{getIcon(service.title)}</div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-800 leading-snug">
                {service.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GeneralConstruction;