"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

// Fallback images matching the previous component
const FALLBACK_IMAGES = {
  "Safety": "https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&q=80&w=800",
  "Fleet": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
  "Innovation": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800",
  "Default": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800"
};

export default function BlogPost() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchSingleBlog = async () => {
      try {
        const json = await apiFetch(`/blogs/${slug}`);

        if (json.success && json.data) {
          setPost(json.data);
        } else {
          setError("Post not found");
        }
      } catch (err) {
        console.error("Failed to fetch the blog post:", err);
        setError("This article couldn't be found.");
      } finally {
        setLoading(false);
      }
    };

    fetchSingleBlog();
  }, [slug]);

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xl font-semibold text-slate-600 animate-pulse">
        Loading article...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-24 text-center flex flex-col items-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Oops!</h1>
        <p className="text-xl text-red-600 mb-8">{error || "This article couldn't be found."}</p>
        <button 
          onClick={() => router.push('/blog')}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          ← Back to all insights
        </button>
      </div>
    );
  }

  const blogImage = post.image || FALLBACK_IMAGES[post.category] || FALLBACK_IMAGES.Default;

  return (
    <article className="py-16 px-6 max-w-4xl mx-auto font-sans bg-white">
      {/* Back Button */}
      <button 
        onClick={() => router.push('/blog')}
        className="text-slate-500 hover:text-red-600 font-medium flex items-center gap-2 mb-8 transition-colors"
      >
        <span>←</span> Back to insights
      </button>

      {/* Header Info */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="px-3 py-1 text-xs uppercase font-bold tracking-widest text-white bg-red-600 rounded">
            {post.category}
          </span>
          <span className="text-sm text-gray-500 font-medium">
            {formatDate(post.publishedAt)} • {post.readTime} min read
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
          {post.title}
        </h1>
        
        {/* Author Details (if available) */}
        {post.author && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Written by</p>
              <p className="text-slate-600 text-sm">{post.author}</p>
            </div>
          </div>
        )}
      </div>

      {/* Featured Image */}
      <div className="relative aspect-video w-full mb-12 rounded-2xl overflow-hidden shadow-lg">
        <img
          src={blogImage}
          alt={post.title}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
        {/* If your content is plain text: */}
        <p>{post.content}</p>
        
        {/* NOTE: If your backend sends HTML (like from a rich text editor), 
            you should replace the <p> tag above with:
            <div dangerouslySetInnerHTML={{ __html: post.content }} /> 
        */}
      </div>
    </article>
  );
}