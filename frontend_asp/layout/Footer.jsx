"use client";
import React, { useEffect, useState } from "react";
import logo from "@/public/footerlogo.jpeg";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const SOCIAL_LABELS = {
  linkedin: "in",
  facebook: "f",
  instagram: "ig", 
  twitter: "x",
  youtube: "yt",
};

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const json = await apiFetch("/settings");
        if (json.success && json.data) {
          setSettings(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const phones = settings?.phone?.length > 0 ? settings.phone : ["+91-20-66744700", "+966 59 705 9690"];
  const email = settings?.email || "enquiry@aspcranes.com";
  const socialLinks = settings?.socialLinks || {};
  const activeSocials = Object.entries(SOCIAL_LABELS).filter(([key]) => socialLinks[key]);

  return (
    <footer className="w-full bg-black text-white relative">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-8 pt-20 pb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
        {/* Logo + Support */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Image src={logo} alt="ASP Cranes" className="h-34 w-auto" />
          </div>

          <div className="text-sm space-y-2">
            <p className="font-semibold">Customer Support</p>
            <p className="text-gray-400">
              Write to us if you have any sales enquiry
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-8 text-lg">Quick Links</h3>
          <ul className="space-y-4 text-sm text-gray-300">
            <li><Link href="/services" className="hover:text-red-500 transition">Services</Link></li>
            <li><Link href="/about" className="hover:text-red-500 transition">About Us</Link></li>
            <li><Link href="/projects" className="hover:text-red-500 transition">Projects</Link></li>
            <li><Link href="/blog" className="hover:text-red-500 transition">Blog</Link></li>
            <li><Link href="/careers" className="hover:text-red-500 transition">Careers</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-8 text-lg">Our Cranes</h3>
          <ul className="space-y-4 text-sm text-gray-300">
            <li><Link href="/our-cranes?category=tower" className="hover:text-red-500 transition">Tower Cranes</Link></li>
            <li><Link href="/our-cranes?category=truck-mounted" className="hover:text-red-500 transition">Truck-Mounted Cranes</Link></li>
            <li><Link href="/our-cranes?category=crawler" className="hover:text-red-500 transition">Crawler Cranes</Link></li>
            <li><Link href="/our-cranes?category=pick-carry" className="hover:text-red-500 transition">Pick & Carry Cranes</Link></li>
          </ul>
        </div>
        {/* Middle Links + Contact */}
        <div className="space-y-10">
          <h3 className="font-semibold mb-8 text-lg">Services</h3>
          <ul className="space-y-4 text-sm text-gray-300">
            <li><Link href="/services" className="hover:text-red-500 transition">Shifting & Loading</Link></li>
            <li><Link href="/services" className="hover:text-red-500 transition">Winch Handling</Link></li>
            <li><Link href="/services" className="hover:text-red-500 transition">Material Handling</Link></li>
            <li><Link href="/services" className="hover:text-red-500 transition">Jacking</Link></li>
            <li><Link href="/services" className="hover:text-red-500 transition">Operations & Maintenance (O&M)</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-8 text-lg">Contact</h3>
          <div className="text-sm text-gray-300 space-y-4">
            <div className="space-y-1">
              <p>{phones.join(" / ")}</p>
              <p>{email}</p>
            </div>
            {/* Social Icons */}
            <div className="flex gap-3">
              {(activeSocials.length > 0
                ? activeSocials
                : Object.entries(SOCIAL_LABELS)
              ).map(([key, label]) => (
                <a
                  key={key}
                  href={socialLinks[key] || "#"}
                  target={socialLinks[key] ? "_blank" : undefined}
                  rel={socialLinks[key] ? "noopener noreferrer" : undefined}
                  className="w-9 h-9 rounded-full border border-gray-500 flex items-center justify-center text-xs hover:bg-red-600 hover:border-red-600 transition"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 max-w-7xl mx-auto"></div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-400">
        <p>
          © Copyrights {new Date().getFullYear()} {settings?.siteName || "ASP Cranes"} Limited. All
          Rights Reserved
        </p>

        <p className="flex gap-2">
          <Link href="/sitemap" className="hover:text-red-500 transition">Site Map</Link>
          <span>|</span>
          <Link href="/privacy-policy" className="hover:text-red-500 transition">Privacy</Link>
        </p>
      </div>
    </footer>
  );
}
