"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import lift from "@/public/homepage/lift.png";
import Button1 from "@/ui/buttons/Button1";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// Fallback images array if the API description/image fields are empty strings
import crane1 from "@/public/homepage/crane1.jpg";
import crane2 from "@/public/homepage/hero1.png";
import crane3 from "@/public/homepage/crane3.jpg";
import crane4 from "@/public/homepage/crane4.jpg";
import { apiFetch } from "@/lib/api";
const fallbackImages = [crane1, crane2, crane3, crane4];

export default function WhatWeOffer() {
  const [cranes, setCranes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCranes = async () => {
      try {
        const json = await apiFetch("/cranes");

        if (json.success && json.data) {
          // Optional: Filter to only show featured/active equipment, sorted by order
          const activeCranes = json.data
            .filter((crane) => crane.isActive)
            .sort((a, b) => a.order - b.order);
          
          setCranes(activeCranes);
        }
      } catch (error) {
        console.error("Error fetching crane data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCranes();
  } , []);

  if (loading) {
    return (
      <div className="w-full bg-white py-24 flex items-center justify-center">
        <p className="text-gray-500 animate-pulse text-lg">Loading equipment fleet...</p>
      </div>
    );
  }

  return (
    <section className="w-full bg-white py-24">
      <div className="max-w-6xl mx-auto px-8">
        {/* Heading */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-lg inline-flex font-bold text-red-500 gap-2 border-b tracking-widest mb-4 relative">
              <Image src={lift} alt="" width={30} height={30} priority />
              <span>OUR CRANES</span>
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Engineered Equipment For Every Lift
            </h2>
          </div>
          <Button1 button1={"See More"} link="/our-cranes" />
        </div>

        {/* Slider */}
        {cranes.length > 0 ? (
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            loop={cranes.length > 3} // Only loop if there are enough slides to fill viewports
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="services-slider"
          >
            {cranes.map((crane, i) => {
              // Determine image: use API image if available, else pick a fallback image
              const craneImg = crane.image && crane.image !== "" ? crane.image : fallbackImages[i % fallbackImages.length];

              return (
                <SwiperSlide key={crane._id || i}>
                  <div className="group shadow rounded-lg m-4 bg-gray-50 flex flex-col justify-between overflow-hidden">
                    {/* Image section */}
                    <div className="overflow-hidden relative">
                      {crane.badge && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                          {crane.badge}
                        </span>
                      )}
                      <Image
                        src={craneImg}
                        alt={crane.name}
                        width={600}
                        height={340}
                        className="w-full h-[340px] rounded-t-lg object-cover group-hover:scale-105 transition duration-500"
                        {...(typeof craneImg !== 'string' ? {
                          placeholder: 'blur',
                          blurDataURL: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4="
                        } : {})}
                      />
                    </div>

                    {/* Metadata Details */}
                    <div className="p-5 flex-grow">
                      <div className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">
                        {crane.category.replace("-", " ")}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                        {crane.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {crane.subtitle || `Capacity: ${crane.capacityLabel}`}
                      </p>
                    </div>

                    {/* Card Link Action */}
                    {/* <Link
                      href={`/our-cranes/${crane.slug}`}
                      className="border-t border-gray-200 bg-white p-4 flex items-center justify-between font-medium text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span>View Specifications</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link> */}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No equipment available at this time.
          </div>
        )}
      </div>
    </section>
  );
}