"use client";

import Image from "next/image";
import Link from "next/link";

export default function Breadcrumbs({
  breadcrumbImage,
  title,
  breadcrumbLabel,
  parentPages = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
  ],
}) {
  return (
    <section className="relative mt-14 h-[220px] sm:h-[260px] md:h-[300px] lg:h-[420px] w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src={breadcrumbImage}
        alt={title}
        fill
        priority
        className="object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        {/* Title */}
        <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-semibold tracking-wide">
          {title}
        </h1>

        {/* Breadcrumb */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-white font-medium">
          {parentPages.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Link
                href={item.href.toLowerCase()}
                className="hover:underline capitalize"
              >
                {item.label}
              </Link>
              <span className="opacity-70">/</span>
            </div>
          ))}

          <span className="uppercase opacity-90">{breadcrumbLabel}</span>
        </div>
      </div>
    </section>
  );
}