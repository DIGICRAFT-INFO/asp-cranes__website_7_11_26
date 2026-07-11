import Link from "next/link";
import { API_URL } from "@/lib/api";
import { FileText, Video } from "lucide-react";
import CraneGallery from "./CraneGallery";

// Fetches a single crane from the backend by slug (server-side).
async function getCrane(slug) {
  try {
    const res = await fetch(`${API_URL}/cranes/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error("Failed to fetch crane detail:", error);
    return null;
  }
}

export default async function CraneDetailPage({ params }) {
  const { slug } = await params;
  const crane = await getCrane(slug);

  if (!crane) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">Crane Not Found!</h1>
        <Link href="/our-cranes" className="text-red-500 font-semibold underline mt-4 hover:text-red-700 transition">
          Back to Fleet
        </Link>
      </div>
    );
  }

  // `specs` comes back from the backend as a plain object (Mongoose Map -> JSON)
  const specs = crane.specs && typeof crane.specs === "object" ? crane.specs : null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 font-sans">
      <Link href="/our-cranes" className="text-red-600 font-bold mb-6 inline-flex items-center gap-2 hover:underline transition">
        &larr; Back to Fleet
      </Link>

      <div className="flex flex-col md:flex-row gap-12 mt-6">
        {/* LEFT SIDE: IMAGE GALLERY */}
        <CraneGallery images={crane.images?.length ? crane.images : (crane.image ? [crane.image] : [])} name={crane.name} />

        {/* RIGHT SIDE: PROFILE DETAILS */}
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div>
            <span className="text-xs font-black text-red-600 uppercase tracking-widest">
              {crane.badge || "Premium Heavy Fleet"}
            </span>
            <h1 className="text-4xl font-extrabold mb-4 text-gray-900 mt-1">{crane.name}</h1>
            {crane.subtitle && (
              <p className="text-sm text-gray-400 italic font-medium mb-3">{crane.subtitle}</p>
            )}

            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {crane.description}
            </p>

            {specs && Object.keys(specs).length > 0 && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black mb-4 border-b pb-2 text-gray-800 tracking-tight uppercase">Technical Specifications</h3>
                <div className="grid grid-cols-1 gap-3.5">
                  {Object.entries(specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center border-b border-gray-200/60 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 text-sm font-medium">{key}</span>
                      <span className="text-gray-900 text-sm font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {crane.features?.length > 0 && (
              <ul className="mt-6 space-y-2">
                {crane.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            {crane.attachments?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {crane.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg px-4 py-2 hover:border-red-400 hover:text-red-600 transition"
                  >
                    {att.type === "video" ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    {att.name || (att.type === "video" ? "Watch Video" : "View Document")}
                  </a>
                ))}
              </div>
            )}
          </div>
          
          <Link
            href={`/contact?crane=${encodeURIComponent(crane.name)}`}
            className="w-full mt-8 bg-red-600 text-white py-4 rounded-xl font-bold text-lg text-center hover:bg-red-700 transition shadow-lg shadow-red-100 active:scale-[0.98]"
          >
            Inquire About This Asset
          </Link>
        </div>
      </div>
    </section>
  );
}
