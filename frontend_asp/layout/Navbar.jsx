"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full fixed top-0 z-50 bg-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              alt="Logo"
              priority
              className="h-14 w-auto"
            />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-black">
            <NavItem label="Home" href="/" />
            <NavItem label="About Us" href="/about" />
            <NavItem label="Our Cranes" href="/our-cranes" />
            <NavItem label="Services" href="/services" />
            <NavItem label="Projects" href="/projects" />
            <NavItem label="Blog" href="/blog" />
            <NavItem label="Careers" href="/careers" />
          </nav>

          {/* DESKTOP CTA */}
          <div className="hidden lg:block">
            <Link href="/contact">
              <button className="bg-red-600 hover:bg-white hover:text-black rounded-sm border border-red-600 text-white text-sm font-semibold px-3 py-2 transition">
                Request a Quote
              </button>
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-3xl text-black"
            aria-label="Toggle Menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`lg:hidden bg-gray-100 transition-all duration-300 overflow-hidden ${
          open ? "max-h-[500px] border-t" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-6 py-4 gap-4 text-sm font-medium text-black">
          <NavItem label="Home" href="/" onClick={() => setOpen(false)} />
          <NavItem label="About Us" href="/about" onClick={() => setOpen(false)} />
          <NavItem label="Our Cranes" href="/our-cranes" onClick={() => setOpen(false)} />
          <NavItem label="Services" href="/services" onClick={() => setOpen(false)} />
          <NavItem label="Projects" href="/projects" onClick={() => setOpen(false)} />
          <NavItem label="Blog" href="/blog" onClick={() => setOpen(false)} />
          <NavItem label="Careers" href="/careers" onClick={() => setOpen(false)} />

          <Link href="/contact" onClick={() => setOpen(false)}>
            <button className="mt-4 bg-red-600 hover:bg-white hover:text-black rounded-sm border border-red-600 text-white text-sm font-semibold px-6 py-3 transition">
              Request a Quote
            </button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* NAV ITEM */
const NavItem = ({ label, href, onClick }) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="cursor-pointer hover:text-red-600 transition"
    >
      {label}
    </Link>
  );
};