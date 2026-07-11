"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Button1 from "@/ui/buttons/Button1";
import { apiFetch } from "@/lib/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const json = await apiFetch("/projects");
        if (json.success) {
          setProjects(json.data);
        } else {
          throw new Error("API response indicated failure.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
        Loading projects...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-red-500">
        Error loading projects: {error}
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 bg-white">
      {/* Heading */}
      <div className="mb-16">
        <h2 className="text-4xl font-bold text-gray-900 uppercase tracking-tight">
          Our Projects
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Delivering excellence through innovation and engineering.
        </p>
      </div>

      <div className="space-y-24">
        {projects.map((project, index) => {
          // Check if index is even or odd to flip the layout
          const isEven = index % 2 === 0;

          // Prefer the new multi-image gallery array; fall back to the legacy
          // single image field, then a generic placeholder if neither exists.
          const projectImages = project.images?.length
            ? project.images
            : project.image
            ? [project.image]
            : ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000"];

          return (
            <div
              key={project._id}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              {/* Image Column - Always first on mobile, flips on desktop if odd */}
              <div className={isEven ? "order-1" : "order-1 md:order-2"}>
                <ImageBox images={projectImages} />
              </div>

              {/* Text Column */}
              <div
                className={`space-y-5 ${isEven ? "order-2" : "order-2 md:order-1"}`}
              >
                <div>
                  <span className="text-red-600 font-bold tracking-widest text-sm uppercase">
                    {project.category}
                  </span>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {project.title}
                  </h3>
                </div>

                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                  {project.description}
                </p>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">
                      Client
                    </p>
                    <p className="text-gray-700 font-medium">
                      {project.client}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">
                      Location
                    </p>
                    <p className="text-gray-700 font-medium">
                      {project.location}
                    </p>
                  </div>
                </div>

                <Button1 button1="About Us" link="/about" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ================= Reusable Image Slider ================= */
function ImageBox({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100 shadow-2xl">
      <Image
        src={images[currentIndex]}
        alt="Project visual"
        fill
        className="object-cover transition-transform duration-1000 group-hover:scale-110"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white backdrop-blur-md text-2xl border border-white/30 flex items-center justify-center transition-all hover:bg-black hover:text-white"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white backdrop-blur-md text-2xl border border-white/30 flex items-center justify-center transition-all hover:bg-black hover:text-white"
          >
            ›
          </button>

          <div className="absolute bottom-6 w-full flex justify-center gap-2">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1 transition-all duration-300 rounded-full ${
                  i === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}