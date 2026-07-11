"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import hero from "@/public/homepage/cta2.png";
import Button1 from "@/ui/buttons/Button1";
import { apiFetch } from "@/lib/api";

export default function CTA() {
  const [cta, setCta] = useState(null);

  useEffect(() => {
    const fetchCta = async () => {
      try {
        const json = await apiFetch("/homepage");
        if (json.success && json.data?.cta) {
          setCta(json.data.cta);
        }
      } catch (error) {
        console.error("Failed to fetch CTA section data:", error);
      }
    };

    fetchCta();
  }, []);

  const title = cta?.title || "Need to rent a crane?";
  const subtitle =
    cta?.subtitle ||
    "Tell us about your project requirements, and our team will provide the most suitable equipment and pricing.";
  const image = cta?.image || hero;
  const btnText = cta?.btnText || "Register Now";
  const btnLink = cta?.btnLink || "/contact";

  return (
    <section className="w-full py-12">
      <div className="max-w-7xl relative mx-auto px-4 sm:px-6">
        <div className=" bg-gray-100 rounded-xl overflow-hidden">
          <div className="flex flex-col-reverse lg:flex-row items-center min-h-[360px]">
            {/* LEFT CONTENT */}
            <div className="w-full lg:w-1/2 p-6 sm:p-10 z-10">
              <h2 className="text-2xl sm:text-3xl font-semibold text-black mb-4">
                {title}
              </h2>

              <p className="mb-6 text-gray-700 max-w-xl">
                {subtitle}
              </p>

              <Button1 button1={btnText} link={btnLink} />
            </div>

            {/* RIGHT IMAGE */}
            <div className="absolute w-full lg:w-1/2 -top-10 lg:right-0 h-[240px] sm:h-[300px] lg:h-full">
              <Image
                src={image}
                alt="Crane Truck"
                fill
                className="object-contain lg:object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
