
"use client"
import Image from "next/image";
import { Heart, Send, Eye, MessageCircle } from "lucide-react";
import { useState } from "react";
import blogs from "./data/blogs.json";
import Link from "next/link";

export default function BlogsPage() {
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredBlogs =
        activeCategory === "All"
            ? blogs
            : blogs.filter((b) => b.category.toLowerCase() === activeCategory.toLowerCase());

    const featuredBlog = filteredBlogs[0];

    return (
        <div className="bg-[#F5F6F7] min-h-screen px-6 md:px-16 py-10">

            {/* Heading */}
            <div className="mb-10">
                <h1 className="text-4xl font-semibold text-[#1F2933]">
                    Today's Headlines: Stay Informed
                </h1>
                <p className="text-gray-500 mt-3 max-w-2xl">
                    Explore the latest news from around the world.
                </p>
            </div>

            {/* Featured Blog */}
            {featuredBlog && (
                <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-sm">

                    <div className="relative w-full md:w-[350px] h-[220px] bg-gray-200 rounded-xl overflow-hidden">
                        <Image
                            src="/new-ui/Railing.webp"
                            alt="blog"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-[#1F2933] mb-3">
                                {featuredBlog.title}
                            </h2>

                            <p className="text-gray-500 mb-6">
                               {featuredBlog.content[0]}
                            </p>

                            <div className="flex flex-wrap gap-8 text-sm text-gray-500 mb-6">
                                <div>
                                    <p className="text-gray-400 text-xs">Category</p>
                                    <p className="text-[#1F2933]">{featuredBlog.category}</p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-xs">Publication Date</p>
                                    <p className="text-[#1F2933]">October 10, 2023</p>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-xs">Author</p>
                                    {/* <p className="text-[#1F2933]">{featuredBlog.author}</p> */}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-6">

                                <div className="flex gap-4 text-sm text-gray-500">
                                    <div className="border px-3 py-1 rounded-full flex items-center gap-1">
                                        <Eye size={14} /> 14k
                                    </div>
                                    <div className="border px-3 py-1 rounded-full flex items-center gap-1">
                                        <MessageCircle size={14} /> 204
                                    </div>
                                </div>

                                <Link
                                    href={`/blogs/${featuredBlog.category.toLowerCase()}/${featuredBlog.slug}`}
                                    className="bg-[#2F3A4F] text-white px-5 py-2 rounded-full inline-block"
                                >
                                    Read More →
                                </Link>

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid Blogs (dummy) */}
            
            {/* Grid Blogs */}
<div className="grid md:grid-cols-3 gap-6 mt-10">

  {filteredBlogs.slice(0, 3).map((item) => (
    <div key={item.slug} className="bg-white rounded-xl p-4 shadow-sm">

      {/* Image */}
      <div className="relative h-[140px] bg-gray-200 rounded-lg mb-4 overflow-hidden">
        <Image
          src="/new-ui/Railing.webp"
          alt="blog"
          fill
          className="object-cover"
        />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[#1F2933] mb-2">
        {item.title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 text-sm mb-4">
        {item.content[0]}
      </p>

      {/* Bottom Section */}
      <div className="flex items-center justify-between mt-4">

        {/* Icons */}
        <div className="flex gap-3 text-sm text-gray-500">

          <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
            <Eye size={14} /> 14k
          </div>

          <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
            <MessageCircle size={14} /> 204
          </div>

        </div>

        {/* Read More */}
        <Link
          href={`/blogs/${item.category.toLowerCase()}/${item.slug}`}
          className="bg-[#2F3A4F] text-white px-4 py-2 rounded-full text-sm"
        >
          Read More →
        </Link>

      </div>

    </div>
  ))}

</div>

            {/* Second Section */}
            <div className="mt-16">

                <h2 className="text-3xl font-semibold text-[#1F2933] mb-6">
                    Discover the World of Headlines
                </h2>

                {/* Categories */}
                <div className="flex items-center justify-between mt-6">
                    <div className="flex flex-wrap gap-4 mb-10">
                        {["All", "industry-insights", "material-guide", "cost-performance", "industry-trends", "future-innovation"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2 rounded-lg border 
                                ${activeCategory === cat
                                        ? "bg-[#2F3A4F] text-white"
                                        : "bg-white text-[#1F2933]"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <Link
                        href={`/blogs/${activeCategory === "All" ? "industry-insights" : activeCategory.toLowerCase()}`}
                        className="border border-gray-300 px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-[#2F3A4F] hover:text-white transition"
                    >
                        View all news →
                    </Link>
                </div>

                {/* List Blogs */}
                {filteredBlogs.map((item) => (
                    <div
                        key={item.slug}
                        className="bg-white rounded-xl p-5 mb-4 flex justify-between items-center shadow-sm"
                    >

                        <div className="flex gap-4 items-start">

                            <div className="relative w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                                <Image
                                    src={featuredBlog.image}
                                    alt="blog"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div>
                                <div className="flex gap-6 text-sm text-gray-400 mb-1">
                                    <div>
                                        {/* <p className="text-[#1F2933] font-medium">{item.author}</p> */}
                                        <p className="text-xs">{item.category}</p>
                                    </div>
                                    <p>October 15, 2023</p>
                                </div>

                                <h3 className="text-lg font-semibold text-[#1F2933]">
                                    {item.title}
                                </h3>

                                <p className="text-gray-500 text-sm mt-1">
                                    {item.content[0]}
                                </p>

                                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                                    <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
                                        <Heart size={14} /> 24.5k
                                    </div>
                                    <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
                                        <MessageCircle size={14} /> 50
                                    </div>
                                    <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
                                        <Send size={14} /> 20
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ✅ FINAL FIX HERE */}
                        <Link
                            href={`/blogs/${item.category.toLowerCase()}/${item.slug}`}
                            className="border border-gray-300 px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-[#2F3A4F] hover:text-white transition"
                        >
                            Read More →
                        </Link>

                    </div>
                ))}

            </div>

        </div>
    );
}