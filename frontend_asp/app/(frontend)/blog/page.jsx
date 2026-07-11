import React from "react";
import banner from "@/public/about/banner.jpg";
import Breadcrumbs from "@/components/Breadcrumbs";
import Blog from "./Blog";

export default function page() {
  return (
    <div>
      <Breadcrumbs
        breadcrumbImage={banner}
        title="Blogs"
        breadcrumbLabel="Blogs"
        parentPages={[{ label: "Home", href: "/" }]}
      />
      <Blog/>
    </div>
  );
}
