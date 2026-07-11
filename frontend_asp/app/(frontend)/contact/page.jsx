import Breadcrumbs from "@/components/Breadcrumbs";
import React from "react";
import banner from "@/public/about/banner.jpg";
import Contact from "@/homepage/Contact";

export default function page() {
  return (
    <div>
      <Breadcrumbs
        breadcrumbImage={banner}
        title="Contact Us"
        breadcrumbLabel="Contact"
        parentPages={[{ label: "Home", href: "/" }]}
      />
      <Contact />
    </div>
  );
}
