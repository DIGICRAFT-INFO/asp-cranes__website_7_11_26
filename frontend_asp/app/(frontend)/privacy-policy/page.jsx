import Breadcrumbs from "@/components/Breadcrumbs";
import banner from "@/public/about/banner.jpg";

export const metadata = {
  title: "Privacy Policy | ASP Cranes",
  description: "How ASP Cranes collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div>
      <Breadcrumbs
        breadcrumbImage={banner}
        title="Privacy Policy"
        breadcrumbLabel="Privacy Policy"
        parentPages={[{ label: "Home", href: "/" }]}
      />
      <section className="max-w-3xl mx-auto px-4 py-16 prose prose-neutral">
        <p className="text-sm text-gray-500">Last updated: {new Date().getFullYear()}</p>

        <h2>Information We Collect</h2>
        <p>
          When you submit an enquiry, request a quote, or apply for a job through this website,
          we collect the details you provide — such as your name, email address, phone number,
          company, and message — so we can respond to your request.
        </p>

        <h2>How We Use Your Information</h2>
        <p>
          We use the information you share solely to respond to enquiries, provide quotes,
          process job applications, and improve our services. We do not sell your personal
          information to third parties.
        </p>

        <h2>Data Storage</h2>
        <p>
          Enquiry and contact data submitted through this site is stored securely in our database
          and is only accessible to authorized ASP Cranes staff.
        </p>

        <h2>Cookies</h2>
        <p>
          This website may use basic cookies to keep the site functioning correctly. We do not use
          cookies for third-party advertising.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this policy or how your data is handled, please reach out via
          our <a href="/contact" className="text-red-600 font-semibold hover:underline">contact page</a>.
        </p>
      </section>
    </div>
  );
}
