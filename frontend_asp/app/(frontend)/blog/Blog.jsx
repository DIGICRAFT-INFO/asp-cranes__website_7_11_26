"use client"

import Button1 from "@/ui/buttons/Button1";
import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

// Fallback images matching the API categories since "image" is empty in the database
const FALLBACK_IMAGES = {
  "Safety": "https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&q=80&w=800",
  "Fleet": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
  "Innovation": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800",
  "Default": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800"
};

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const json = await apiFetch("/blogs");

        if (json.success && Array.isArray(json.data)) {
          setBlogs(json.data);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="py-16 text-center text-xl font-semibold text-slate-600">
        Loading latest insights...
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="py-16 text-center text-xl font-semibold text-red-600">
        Error loading posts: {error}
      </div>
    );
  }

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto font-sans bg-white">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex justify-between flex-col gap-4 items-start">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Industry Insights
          </h2>
          <p className="text-slate-600">
            Expert trends, analysis, and updates across industries
          </p>
        </div>
        <Button1 button1="Know More" link="/blog" />
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {blogs.map((item) => {
          // Determine image: use item.image if available, otherwise match category or use fallback
          const blogImage = item.image || FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES.Default;

          return (
            <div 
              key={item._id} 
              className="group shadow rounded-xl cursor-pointer bg-white overflow-hidden flex flex-col justify-between"
              onClick={() => window.location.href = `/blog/${item.slug}`}
            >
              <div>
                {/* Image Container with Aspect Ratio */}
                <div className="relative aspect-video w-full mb-6 overflow-hidden rounded-t-xl bg-gray-200">
                  <img
                    src={blogImage}
                    alt={item.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col px-4 items-start">
                  <span className="mb-3 px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-white bg-red-600 rounded">
                    {item.category}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-3 transition-colors group-hover:text-red-600">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm line-clamp-3">
                    {item.excerpt || item.content}
                  </p>
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="px-4 pb-4 mt-4">
                <div className="flex items-center text-sm font-semibold text-slate-900 group-hover:text-red-700 transition-all gap-1 group-hover:gap-2">
                  Read Article
                  <span className="transition-all duration-300">→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}