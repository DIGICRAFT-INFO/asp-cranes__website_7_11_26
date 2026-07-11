"use client";
import Button1 from "@/ui/buttons/Button1";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import lift from "@/public/homepage/lift.png";
import { apiFetch } from "@/lib/api";

// Fallback images array to use when the API returns an empty image string
const fallbackImages = [
  "https://images.unsplash.com/photo-1590650046871-92c887180603?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=1200&auto=format&fit=crop"
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const jsonResult = await apiFetch("/services");

        // Filter out inactive services and sort if needed
        const activeServices = jsonResult.data.filter(service => service.isActive);
        setServices(activeServices);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-24 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600 animate-pulse">Loading Services...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-24 flex items-center justify-center">
        <div className="text-xl font-semibold text-red-500">Error: {error}</div>
      </section>
    );
  }

  return (
    <section className="w-full py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-lg inline-flex font-bold text-red-500 gap-2 border-b tracking-widest mb-4 relative">
              <Image src={lift} alt="" width={30} height={30} priority />
              <span>OUR SERVICES</span>
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Reliable Solutions for Heavy & <br /> Industrial Operations
            </h2>
          </div>
          <Button1 button1={"See More"} link="/our-cranes" />
        </div>

        {/* Services Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            // Pick a fallback image if the API image string is empty
            const serviceImage = service.image || fallbackImages[index % fallbackImages.length];

            return (
              <div
                key={service._id} // Using the unique MongoDB _id as key
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={serviceImage}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover hover:scale-110 transition duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 line-clamp-1">
                    {service.title}
                  </h3>

                  <p className="text-gray-600 mb-6 flex-grow line-clamp-3">
                    {service.description}
                  </p>

                  {/* Optional: pass dynamic link via slug if you build detailed pages later */}
                  {/* <Button1 button1="Explore More" link={`/services/${service.slug}`} /> */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}