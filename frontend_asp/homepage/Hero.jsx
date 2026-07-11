"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

// Retaining your local background images
import hero1 from "@/public/homepage/hero1.jpg";
import hero2 from "@/public/homepage/hero12.jpg";
import hero3 from "@/public/homepage/hero13.jpg";
import hero4 from "@/public/homepage/hero14.jpg";
import hero5 from "@/public/homepage/hero15.jpg";
import hero6 from "@/public/homepage/hero16.jpg";

const localImages = [hero1, hero2, hero3, hero4, hero5, hero6];

export default function Hero() {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic content from API
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const json = await apiFetch("/homepage");

        if (json.success && json.data?.hero?.slides) {
          // Map local images to the dynamic API text elements
          const dynamicSlides = json.data.hero.slides.map((slide, idx) => ({
            ...slide,
            // Use image from API if it exists, otherwise fall back to local array
            imageSrc: slide.image || localImages[idx % localImages.length],
          }));
          setSlides(dynamicSlides);
        }
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  const nextSlide = () =>
    setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  const prevSlide = () =>
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  // Autoplay functionality
  useEffect(() => {
    if (!isPaused && slides.length > 0) {
      const interval = setInterval(nextSlide, 4000);
      return () => clearInterval(interval);
    }
  }, [index, isPaused, slides.length]);

  // Loading state placeholder to prevent crashes before data arrives
  if (loading || slides.length === 0) {
    return (
      <div className="w-full h-[90vh] lg:h-screen bg-neutral-900 flex items-center justify-center text-white">
        <p className="animate-pulse tracking-widest text-sm">LOADING HERO SLIDER...</p>
      </div>
    );
  }

  return (
    <section
      className="relative w-full h-[90vh] lg:h-screen overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* SLIDES */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={slide._id || i} className="relative min-w-full h-full text-white">
            {/* Background Image */}
            <Image
              src={slide.imageSrc}
              alt={slide.title}
              fill
              priority={i === 0}
              className="object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* CONTENT */}
            <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
              <div className="max-w-xl text-center lg:text-left">
                <p className="uppercase tracking-widest text-xs sm:text-sm mb-3 text-red-500 font-bold">
                  {slide.subtitle}
                </p>

                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4">
                  {slide.title}
                </h1>

                <p className="text-gray-200 text-sm sm:text-base lg:text-lg mb-6">
                  {slide.description}
                </p>

                <div className="flex flex-col w-full sm:flex-row gap-4 max-lg:items-center">
                  {/* Button 1 - Dynamically Linked */}
                  <Link 
                    href={slide.btn1Link || "/about"} 
                    className="flex items-center bg-white max-lg:pl-12 pl-4 justify-between border border-gray-800 rounded-md font-semibold text-gray-900 hover:bg-red-600 hover:text-white transition group"
                  >
                    {slide.btn1Text}
                    <span className="px-4 py-2 max-lg:ml-12 ml-4 text-2xl rounded-r-md bg-red-600 text-white group-hover:bg-white group-hover:text-gray-800 transition">
                      »
                    </span>
                  </Link>

                  {/* Button 2 - Dynamically Linked */}
                  <Link 
                    href={slide.btn2Link || "/contact"}
                    className="bg-white border text-black text-center hover:text-white hover:bg-red-600 transition max-lg:px-20 px-10 py-3 rounded-md font-semibold"
                  >
                    {slide.btn2Text}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NAV BUTTONS */}
      <div className="absolute bottom-6 right-6 flex gap-3 z-20">
        <button
          onClick={prevSlide}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 text-white flex items-center justify-center text-xl hover:bg-white/40 transition"
        >
          ‹
        </button>
        <button
          onClick={nextSlide}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 text-white flex items-center justify-center text-xl hover:bg-white/40 transition"
        >
          ›
        </button>
      </div>

      {/* DOTS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <span
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1 rounded-full cursor-pointer transition-all ${
              index === i ? "w-8 bg-red-600" : "w-4 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}