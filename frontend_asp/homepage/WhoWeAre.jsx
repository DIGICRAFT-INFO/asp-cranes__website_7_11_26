"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

// Local image fallbacks for when API image strings are empty
import whoweare1 from "@/public/homepage/whoweare1.jpg";
import whoweare2 from "@/public/homepage/whoweare2.jpg";
import whoweare3 from "@/public/homepage/whoweare3.jpg";

const fallbackImages = [whoweare1, whoweare2, whoweare3];

export default function WhoWeAre() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWhoWeAreData = async () => {
      try {
        const result = await apiFetch("/about");

        if (result.success && result.data?.whoWeAreCards) {
          setServices(result.data.whoWeAreCards);
        }
      } catch (error) {
        console.error("Error fetching Who We Are data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWhoWeAreData();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white flex justify-center items-center">
        <p className="text-gray-500 font-semibold animate-pulse">Loading...</p>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white flex flex-col justify-center items-center">
      <div className="text-center mb-14">
        <h2 className="text-3xl font-bold text-red-600">WHO WE ARE</h2>
      </div>
      
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="max-w-6xl w-full px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {services.map((service, i) => {
          // Use the API image if it exists, otherwise use the local fallback based on index
          const imageSrc = service.image ? service.image : fallbackImages[i % fallbackImages.length];

          return (
            <motion.div
              key={service._id || i}
              variants={card}
              className={`group relative overflow-hidden shadow-lg`}
            >
              {/* Background Image */}
              <Image
                src={imageSrc}
                alt={service.title}
                width={500}
                height={500}
                className="object-cover transition-transform duration-500 group-hover:scale-110 w-full h-full min-h-[400px]"
              />

              {/* Default Bottom Title */}
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t to-black/10 from-black/80 text-white p-5 transition-all duration-500 group-hover:opacity-0">
                <h3 className="text-4xl font-semibold mb-2">{service.title}</h3>
                <p>Read More »</p>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-linear-to-t to-black/0 from-black/90 text-white p-6 translate-y-full group-hover:translate-y-0 transition-all duration-500 flex flex-col justify-end">
                <div>
                  <h3 className="text-4xl font-bold mt-3">{service.title}</h3>
                  {/* Note: Updated from service.desc to service.description to match API */}
                  <p className="text-sm mt-3 leading-relaxed">{service.description}</p>
                  <a
                    href={service.link}
                    className="mt-5 hover:text-red-600 inline-flex items-center gap-2 font-semibold"
                  >
                    Read More »
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}