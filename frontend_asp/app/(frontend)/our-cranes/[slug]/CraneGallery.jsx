"use client";

import { useState } from "react";
import Image from "next/image";

const FALLBACK = "https://images.unsplash.com/photo-1504307651254-35680f356dfd";

export default function CraneGallery({ images, name }) {
  const gallery = images?.length ? images : [FALLBACK];
  const [active, setActive] = useState(0);

  return (
    <div className="w-full md:w-1/2">
      <div className="relative h-[450px] rounded-2xl overflow-hidden shadow-md border bg-gray-100">
        <Image src={gallery[active]} alt={name} fill className="object-cover" priority />
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
          {gallery.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                active === i ? "border-red-600" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt={`${name} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
