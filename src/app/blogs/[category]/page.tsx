"use client";

import { useParams } from "next/navigation";
import blogs from "../data/blogs.json";
import Image from "next/image";
import { Heart, Send, Eye, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


export default function CategoryPage() {
     const [copied, setCopied] = useState<string | null>(null);
      const handleCopyLink = (slug: string, category: string) => {
      const url = `${window.location.origin}/blogs/${category.toLowerCase()}/${slug}`;
      navigator.clipboard.writeText(url);
    
      setCopied(slug);
    
      setTimeout(() => setCopied(null), 1000);
    };
    const params = useParams();
    const category = params.category as string;

    const filteredBlogs = blogs.filter(
        (b) => b.category.toLowerCase() === category.toLowerCase()
    );

    return (
        <div className="p-10">

            <h1 className="text-2xl font-bold mb-6">
                {category.toUpperCase()} BLOGS
            </h1>

            {filteredBlogs.map((item) => (
                <div
                    key={item.slug}
                    className="bg-white rounded-xl p-5 mb-4 flex justify-between items-center shadow-sm"
                >

                    {/* LEFT SIDE */}
                    <div className="flex gap-4 items-start">

                        {/* Profile Image Placeholder */}
                        <div className=" relative w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                            <Image
                                src={item.image}
                                alt="blog"
                                fill
                                className="object-cover"
                            />

                        </div>

                        <div>

                            {/* Author + Date */}
                            <div className="flex gap-6 text-sm text-gray-400 mb-1">
                                <div>
                                    {/* <p className="text-[#1F2933] font-medium">{item.author}</p> */}
                                    <p className="text-xs">{item.category}</p>
                                </div>

                                <p>{item.date}</p>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-semibold text-[#1F2933]">
                                {item.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-500 text-sm mt-1">
                                {item.content[0]}
                            </p>

                            {/* Stats */}
                            <div className="flex gap-4 mt-3 text-sm text-gray-500">

                                {/* <div className="flex items-center gap-1 border px-3 py-1 rounded-full">
                                    <Heart size={14} /> {item.likes}
                                </div> */}

                                <div className="border px-3 py-1 rounded-full flex items-center gap-1">
                                    ⏱ {item.readTime}
                                </div>

                               <div
  onClick={() => handleCopyLink(item.slug, item.category)}
  className="flex items-center gap-1 border px-3 py-1 rounded-full cursor-pointer"
>
  <Send size={14} />
  {copied === item.slug ? "Copied!" : "Share"}
</div>

                            </div>

                        </div>
                    </div>

                    {/* RIGHT SIDE BUTTON */}
                    <Link href={`/blogs/${item.category.toLowerCase()}/${item.slug}`}>
                        <button className="px-4 py-2 rounded-full text-sm border border-[#2F3A4F] text-[#2F3A4F] hover:bg-[#2F3A4F] hover:text-white transition duration-300">
                            Read More →
                        </button>
                    </Link>

                </div>
            ))}

        </div>
    );
}