"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import about from "@/public/homepage/about.png";
import lift from "@/public/homepage/lift.png";
import Button1 from "@/ui/buttons/Button1";
import { apiFetch } from "@/lib/api";

export default function About() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic content from API
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const json = await apiFetch("/homepage");

        if (json.success && json.data?.about) {
          setAboutData(json.data.about);
        }
      } catch (error) {
        console.error("Failed to fetch about section data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  // Soft fallback layout if loading or if API fails to resolve
  if (loading) {
    return (
      <div className="w-full bg-gray-50 py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Use values from API with your original text acting as safe default strings
  const tagline = aboutData?.tagline || "ABOUT US";
  const title = aboutData?.title || "Our Commitment To Excellence In Construction And Design";
  const buttonText = aboutData?.btnText || "About Us";
  const buttonLink = aboutData?.btnLink || "/about";
  
  // Filter out any accidental empty paragraphs from the database
  const paragraphs = aboutData?.paragraphs?.filter(p => p.trim() !== "") || [];

  return (
    <section className="w-full bg-gray-50 py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        {/* Top Content */}
        <div className="flex max-lg:flex-col gap-10 items-start">
          {/* Left Crane Image */}
          <div className="relative w-full h-full lg:w-1/2">
            <Image
              src={about}
              alt="About ASP Cranes"
              className="w-full h-auto object-cover rounded-md"
              priority
            />
          </div>

          {/* Right Content */}
          <div className="w-full lg:w-1/2">
            <p className="text-lg flex font-semibold text-red-500 gap-2 border-b tracking-widest mb-4 relative items-center pb-2">
              <Image src={lift} alt="" width={30} height={30} priority /> 
              <span>{tagline}</span>
            </p>

            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              {title}
            </h2>

            {/* Render paragraphs dynamically */}
            {paragraphs.map((para, index) => (
              <p key={index} className="text-gray-500 leading-relaxed mb-4 geographic-paragraph">
                {para}
              </p>
            ))}

            {/* Dynamic CTA Routing */}
            <div className="mt-8 block">
              <Button1 button1={buttonText} link={buttonLink} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}