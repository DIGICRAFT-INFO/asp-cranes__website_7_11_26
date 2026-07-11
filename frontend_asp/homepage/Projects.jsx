"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Button1 from "@/ui/buttons/Button1";
import { apiFetch } from "@/lib/api";

export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState([]);
  const [active, setActive] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the API
  useEffect(() => {
    async function fetchProjects() {
      try {
        const result = await apiFetch("/projects");

        if (result.success) {
          setProjects(result.data);
          setFilters(result.categories);
          
          // Set the first available category as active by default
          if (result.categories && result.categories.length > 0) {
            setActive(result.categories[0]);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Filter projects dynamically based on the active state
  const filteredProjects = projects.filter(
    (p) => p.category === active && p.isActive
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24 text-gray-500">
        Loading amazing projects...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-24 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold uppercase tracking-wide">
            Our <span className="text-red-600">Projects</span>
          </h2>
          <p className="text-gray-500 mt-4 text-sm">
            Discover our latest architectural masterpieces and cutting-edge industrial hubs crafted with sustainability and precision.
          </p>
        </div>

        {/* Dynamic Filters */}
        <div className="flex flex-wrap justify-center gap-8 mb-14">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`text-sm uppercase font-semibold transition ${
                active === item
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-600 hover:text-red-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Grid Displaying API data */}
        {filteredProjects.length === 0 ? (
          <p className="text-center text-gray-400 my-10">No projects found in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="relative w-full h-72 overflow-hidden group rounded-lg shadow-sm border border-gray-100"
              >
                {/* Fallback layout if API image is empty string */}
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex flex-col justify-center items-center p-6 text-center">
                    <span className="text-xs uppercase tracking-wider text-red-500 font-bold mb-1">
                      {project.location}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800">{project.title}</h3>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3 px-4">
                      {project.description}
                    </p>
                  </div>
                )}
                
                {/* Optional Hover Overlay to display info when image is present */}
                {project.image && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                    <p className="text-xs text-red-400 uppercase tracking-widest">{project.location}</p>
                    <h4 className="text-xl font-bold">{project.title}</h4>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {/* <div className="text-center w-full justify-center items-center flex mt-16">
          <Button1 button1="Load More" />
        </div> */}
      </div>
    </section>
  );
}