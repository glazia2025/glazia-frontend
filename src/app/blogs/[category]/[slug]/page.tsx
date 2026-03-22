"use client";

import { useParams } from "next/navigation";
import { blogs } from "../../data/blogData";
import Image from "next/image";
import { Heart, Eye, Send } from "lucide-react";
import { useState } from "react";

export default function BlogDetailPage() {
    const [showFull, setShowFull] = useState(false);
  const params = useParams();

  const category = params.category as string;
  const slug = params.slug as string;

  //  correct blog find karo
  const blog = blogs.find(
    (b) =>
      b.slug === slug &&
      b.category.toLowerCase() === category.toLowerCase()
  );

  //  agar blog na mile
  if (!blog) {
    return <div className="p-10">Blog not found</div>;
  }

  return (
    <div className="bg-[#F5F6F7] min-h-screen">

      {/*  HERO SECTION */}
      <div className="relative w-full h-[350px]">

        <Image
          src="/new-ui/Railing.webp"
          alt="blog"
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/40"></div>

        <h1 className="absolute bottom-10 left-10 text-white text-3xl md:text-5xl font-semibold max-w-3xl">
          {blog.title}
        </h1>
      </div>

      {/*  MAIN CONTENT */}
      <div className="grid md:grid-cols-3 gap-10 px-6 md:px-16 py-10">

        {/* LEFT SIDE */}
        <div className="md:col-span-2">

          <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
            Introduction
          </h2>

         <p className="text-gray-600 mb-6">
  {showFull ? blog.content : blog.content.slice(0, 200) + "..."}
</p>

          <h2 className="text-xl font-semibold text-[#1F2933] mb-3">
            Details
          </h2>

          <p className="text-gray-600 mb-6">
            {blog.content}
          </p>

        <button
  onClick={() => setShowFull(!showFull)}
  className="border border-gray-300 px-5 py-2 rounded-full hover:bg-[#2F3A4F] hover:text-white transition"
>
  {showFull ? "Show Less ↑" : "Read Full Blog ↓"}
</button>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white p-6 rounded-xl shadow-sm h-fit">

          {/* Stats */}
          <div className="flex gap-4 mb-6 text-sm text-gray-500">

            <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
              <Heart size={14} /> 24.5k
            </div>

            <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
              <Eye size={14} /> 50k
            </div>

            <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
              <Send size={14} /> 206
            </div>

          </div>

          {/* Info */}
          <div className="space-y-4 text-sm">

            <div>
              <p className="text-gray-400 text-xs">Publication Date</p>
              <p className="text-[#1F2933]">October 15, 2023</p>
            </div>

            <div>
              <p className="text-gray-400 text-xs">Category</p>
              <p className="text-[#1F2933]">{blog.category}</p>
            </div>

            <div>
              <p className="text-gray-400 text-xs">Reading Time</p>
              <p className="text-[#1F2933]">10 Min</p>
            </div>

            <div>
              <p className="text-gray-400 text-xs">Author</p>
              <p className="text-[#1F2933]">{blog.author}</p>
            </div>

          </div>

          {/* TOC */}
          <div className="mt-6">
            <h3 className="text-[#1F2933] font-semibold mb-3">
              Table of Contents
            </h3>

            <ul className="text-sm text-gray-500 space-y-2">
              <li>• Introduction</li>
              <li>• Details</li>
              <li>• Conclusion</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}