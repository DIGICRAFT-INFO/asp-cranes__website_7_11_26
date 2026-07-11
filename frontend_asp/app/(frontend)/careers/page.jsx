import Breadcrumbs from "@/components/Breadcrumbs";
import hero1 from "@/public/homepage/hero1.jpg";
import Contact from "@/homepage/Contact";
import CareersList from "./CareersList";

export const metadata = {
  title: "Careers | ASP Cranes",
  description:
    "Join the ASP Cranes team. Explore current openings for crane operators, technicians, and support staff.",
};

export default function CareersPage() {
  return (
    <div>
      <Breadcrumbs
        breadcrumbImage={hero1}
        title="Careers"
        breadcrumbLabel="Careers"
        parentPages={[{ label: "Home", href: "/" }]}
      />
      <CareersList />
      <Contact />
    </div>
  );
}
