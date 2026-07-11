"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

import "swiper/css";
import "swiper/css/pagination";

const FALLBACK_IMAGES = ["/bridge.jpg", "/building-1.jpg", "/crane.jpg", "/building-2.jpg"];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiFetch("/projects")
      .then((json) => {
        if (mounted && json.success) {
          setProjects((json.data || []).filter((p) => p.isActive).slice(0, 6));
        }
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || projects.length === 0) return null;

  return (
    <section className="bg-white py-12 sm:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3">
              Check our latest projects
            </h2>
            <p className="text-gray-500 text-sm">
              We are the best construction agency in the world
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-block bg-red-500 py-2.5 px-5 rounded-md text-white hover:bg-red-600 transition self-start"
          >
            See More
          </Link>
        </div>

        {/* Slider */}
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1.1}
          centeredSlides
          loop={projects.length > 2}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true, el: ".custom-pagination" }}
          breakpoints={{
            640: { slidesPerView: 1.4 },
            1024: { slidesPerView: 2.2 },
          }}
        >
          {projects.map((project) => (
            <SwiperSlide key={project._id}>
              {({ isActive }) => (
                <div
                  className={`relative overflow-hidden rounded-sm transition-all duration-700 ${
                    isActive ? "scale-100 opacity-100" : "scale-90 opacity-40"
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-[260px] sm:h-[320px] md:h-[400px] w-full">
                    <Image
                      src={project.image || FALLBACK_IMAGES[0]}
                      alt={project.title}
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div className="text-white">
                      <span className="bg-gray-800/80 text-[10px] uppercase px-2 py-1 tracking-widest inline-block mb-2">
                        {project.category || "Project"}
                      </span>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
                        {project.title}
                      </h3>
                      {project.location && (
                        <p className="text-gray-300 text-xs sm:text-sm mt-1">{project.location}</p>
                      )}
                    </div>

                    <Link
                      href="/projects"
                      className="bg-red-600 hover:bg-red-700 text-white uppercase text-xs font-bold px-5 py-3 sm:px-6 sm:py-4 flex items-center gap-2 transition-colors w-fit"
                    >
                      View Project
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination */}
        <div className="custom-pagination flex justify-center gap-2 mt-8"></div>
      </div>

      {/* Pagination Styles */}
      <style jsx global>{`
        .custom-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.3s;
        }
        .custom-pagination .swiper-pagination-bullet-active {
          background: #f97316;
          width: 24px;
          border-radius: 4px;
        }
      `}</style>
    </section>
  );
}