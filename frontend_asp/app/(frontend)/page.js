import About from "@/homepage/About";
import Advantages from "@/homepage/Advantages";
import CTA from "@/homepage/CTA";
import FAQ from "@/homepage/FAQ";
import HeroSlider from "@/homepage/Hero";
import Clients from "@/homepage/Clients";
import Projects from "@/homepage/Projects";
import Services from "@/homepage/Services";
import OurProducts from "@/homepage/Products";
import WhoWeAre from "@/homepage/WhoWeAre";
import React from "react";
import Blog from "./blog/Blog";

export default function page() {
  return (
    <div>
      <HeroSlider />
      <About />
      <WhoWeAre />
      <OurProducts />
      <Services />
      <Projects />
      <Advantages />
      <Clients />
      <Blog/>
      <FAQ />
      <CTA />
    </div>
  );
}
