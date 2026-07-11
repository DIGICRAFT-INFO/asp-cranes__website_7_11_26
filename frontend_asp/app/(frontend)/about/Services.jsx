"use client";

import React from "react";
import { HardHat, Ruler, Construction } from "lucide-react";

const Services = () => {
  const services = [
    {
      title: "Shifting & Loading",
      desc: "We specialize in heavy equipment shifting and loading for industrial plants, infrastructure sites, and factories. Our team ensures precise handling, minimizing downtime and risk.",
      icon: <Construction className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />,
    },
    {
      title: "Winch Handling",
      desc: "Professional winch operations for controlled pulling, positioning, and lifting of heavy components in confined or challenging environments.",
      icon: <Ruler className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />,
    },
    {
      title: "Material Handling",
      desc: "Complete material handling solutions including lifting, positioning, and movement of heavy and oversized materials using appropriate equipment.",
      icon: <HardHat className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />,
    },
    {
      title: "Jacking (Machine Jacking & Leveling)",
      desc: "Accurate machine jacking and leveling services for installation, alignment, and relocation of industrial machinery.",
      icon: <HardHat className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />,
    },
    {
      title: "Operations & Maintenance (O&M)",
      desc: "Dedicated O&M services for long-term projects, ensuring equipment uptime, safety compliance, and operational efficiency.",
      icon: <HardHat className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />,
    },
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight">
          The services <br className="hidden sm:block" /> we provide
        </h2>

        <a
          href="/services"
          className="inline-block bg-red-500 py-2.5 px-6 text-white rounded-md hover:bg-red-600 transition self-start md:self-auto"
        >
          Know More
        </a>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-[#F9FAFB] p-6 sm:p-8 flex items-start gap-4 rounded-lg transition-all hover:shadow-md group"
          >
            {/* Icon */}
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-2 bg-red-100 rounded-full opacity-50"></div>
              <div className="relative">{service.icon}</div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-snug">
                {service.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                {service.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;