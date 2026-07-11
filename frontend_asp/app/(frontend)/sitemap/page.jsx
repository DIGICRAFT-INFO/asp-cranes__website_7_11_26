import Breadcrumbs from "@/components/Breadcrumbs";
import banner from "@/public/about/banner.jpg";
import Link from "next/link";

export const metadata = {
  title: "Site Map | ASP Cranes",
  description: "All pages on the ASP Cranes website.",
};

const links = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Cranes", href: "/our-cranes" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

export default function SitemapPage() {
  return (
    <div>
      <Breadcrumbs
        breadcrumbImage={banner}
        title="Site Map"
        breadcrumbLabel="Site Map"
        parentPages={[{ label: "Home", href: "/" }]}
      />
      <section className="max-w-3xl mx-auto px-4 py-16">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block px-5 py-4 rounded-xl border border-gray-200 hover:border-red-400 hover:bg-red-50 text-gray-800 font-semibold transition"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
