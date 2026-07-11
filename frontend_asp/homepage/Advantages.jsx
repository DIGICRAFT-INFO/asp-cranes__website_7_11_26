"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import advantagesImage from "@/public/homepage/advantages.jpeg";
import Button1 from "@/ui/buttons/Button1";
import { apiFetch } from "@/lib/api";

export default function Advantages() {
  const [data, setData] = useState(null);

  // Fetch the "advantages" section from the homepage document
  useEffect(() => {
    const fetchAdvantages = async () => {
      try {
        const json = await apiFetch("/homepage");
        if (json.success && json.data?.advantages) {
          setData(json.data.advantages);
        }
      } catch (error) {
        console.error("Failed to fetch advantages section data:", error);
      }
    };

    fetchAdvantages();
  }, []);

  // Fallback to static content if API array fields are empty
  const title = data?.title || "Advantages of Renting";
  const subtitle = data?.subtitle || "through the ASP Cranes platform";
  const btnText = data?.btnText || "Register Now";
  const btnLink = data?.btnLink || "/contact";

  const customerPoints = data?.customerPoints?.length > 0 
    ? data.customerPoints 
    : [
        "Expedited Procurement",
        "Nationwide Access to Extensive Crane Inventory",
        "Competitive MOB/DEMOB Rates Comparison and Transparency",
        "Unified and Simplified Proposal Tracking",
        "Expert Engineering and Logistics Support",
        "All-in-One Rental Agreement"
      ];

  const rentalPoints = data?.rentalPoints?.length > 0 
    ? data.rentalPoints 
    : [
        "Company Account Registration",
        "Hassle-Free Fleet Upload and Document Sharing",
        "Access to Verified Customers and Rental Enquiries",
        "Contract Documents and Terms & Conditions Support",
        "Streamlined Rental Process and Documentation",
        "Boosting Opportunities, Efficiency, and Profitability"
      ];

  const advantagesImg = data?.image || advantagesImage;

  return (
    <section className="w-full bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT CONTENT */}
          <div>
            {/* Heading */}
            <h2 className="text-3xl font-bold text-gray-900">
              {title}
            </h2>
            <p className="text-lg text-gray-500 mt-2">
              {subtitle}
            </p>

            {/* For Customers */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600">
                  <span className="text-white text-lg font-bold">C</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  For Customers
                </h3>
              </div>

              <ul className="space-y-2 text-gray-600">
                {customerPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* For Rental Company */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600">
                  <span className="text-white text-lg font-bold">R</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  For Rental Company
                </h3>
              </div>

              <ul className="space-y-2 text-gray-600">
                {rentalPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Button */}
            <div className="mt-10">
              <Button1 button1={btnText} link={btnLink} />
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex justify-center lg:justify-end">
            <Image
              src={advantagesImg}
              alt="Crane Hook"
              width={600}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
          
        </div>
      </div>
    </section>
  );
} 
