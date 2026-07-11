"use client";

import React, { useEffect, useState } from "react";
import { Target, Eye } from "lucide-react";
import Image from "next/image";
import lift from "@/public/homepage/lift.png";
import Button1 from "@/ui/buttons/Button1";
import { apiFetch } from "@/lib/api";

const About = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching the API data dynamically
    apiFetch("/about")
      .then((resData) => {
        if (resData.success) {
          setAboutData(resData.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching about page data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center font-sans text-slate-600">
        Loading...
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="py-16 text-center font-sans text-slate-600">
        Failed to load content.
      </div>
    );
  }

  const { section1, mission, vision } = aboutData;

  // Filters out isolated marker circles (e.g., "○") to safely fetch text items
  const highlightItems = section1?.highlights?.filter(
    (item) => item.trim() !== "○"
  ) || [];

  return (
    <section className="bg-white py-16 px-4 md:px-8 lg:px-16 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col max-lg:flex-col-reverse lg:flex-row gap-12 items-center">
        
        {/* Left Content Side */}
        <div className="w-full lg:w-1/2">
          {section1?.tagline && (
            <p className="text-lg inline-flex font-bold text-red-500 gap-2 border-b tracking-widest mb-4 relative">
              <Image src={lift} alt="Lift Icon" width={30} height={30} priority />
              <span>{section1.tagline}</span>
            </p>
          )}

          <h1 className="text-4xl md:text-6xl font-semibold text-slate-900 mb-4 leading-tight">
            {section1?.title || "WE BUILD EVERYTHING THAT YOU NEED"}
          </h1>

          {section1?.paragraphs?.map((para, index) => (
            <p key={index} className="text-slate-600 text-lg leading-relaxed mb-4 max-w-xl">
              {para}
            </p>
          ))}

          {highlightItems.length > 0 && (
            <ul className="space-y-4 mb-4">
              {highlightItems.map((highlight, index) => (
                <li key={index} className="flex items-center gap-3 text-slate-800 font-semibold">
                  <span className="w-5 h-5 border-2 border-orange-500 rounded-full flex items-center justify-center text-[10px] text-orange-500">
                    ○
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-1 mb-8 md:grid-cols-2 gap-8 pt-4">
            {mission && (
              <div className="flex gap-4">
                <div className="bg-slate-50 p-4 rounded-sm flex-shrink-0">
                  <Target className="text-orange-600 w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900">Our Mission</h3>
                  <p className="text-slate-500 text-sm mt-1">{mission}</p>
                </div>
              </div>
            )}

            {vision && (
              <div className="flex gap-4">
                <div className="bg-slate-50 p-4 rounded-sm flex-shrink-0">
                  <Eye className="text-orange-600 w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900">Our Vision</h3>
                  <p className="text-slate-500 text-sm mt-1">{vision}</p>
                </div>
              </div>
            )}
          </div>

          <Button1 button1={section1?.btnText || "About Us"} link={section1?.btnLink || "/contact"} />
        </div>

        {/* Right Image Side */}
        <div className="w-full lg:w-1/2 relative">
          <div className="relative z-10 overflow-hidden rounded-sm">
            <Image
              src={section1?.image || "/_next/static/media/about.d7e1d859.jpg"}
              alt="Construction Worker / Crane Services"
              width={1000}
              height={1000}
              priority
              className="w-full object-cover"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .clip-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </section>
  );
};

export default About;