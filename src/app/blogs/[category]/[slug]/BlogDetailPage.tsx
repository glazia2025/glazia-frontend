"use client";
import Image from "next/image";
import { Heart, Eye, Send } from "lucide-react";
import { useState } from "react";
import type { Blog } from "@/services/blogService";
import { renderContent } from "@/utils/renderContent";

type BlogDetailProps = {
    blog: Blog | null;
};

// export default function BlogDetailPage() {
export default function BlogDetail({
    blog,
}: BlogDetailProps) {
    const [copied, setCopied] = useState<string | null>(null);
    const handleCopyLink = (slug: string, category: string) => {
        const url = `${window.location.origin}/blogs/${category.toLowerCase()}/${slug}`;
        navigator.clipboard.writeText(url);

        setCopied(slug);

        setTimeout(() => setCopied(null), 1000);
    };
    const [showFull, setShowFull] = useState(false);
    if (!blog) {
        return <div className="p-10">Blog not found</div>;
    }

    return (
        <div className="bg-[#F5F6F7] min-h-screen">

            {/*  HERO SECTION */}
            <div className="relative w-full h-[350px]">

                <Image
                    src={blog.image}
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

                    <div className="text-gray-600 mb-6 space-y-4">
                        {(showFull ? blog.content : blog.content.slice(0, 6)).map((item: string, index: number) => {
                            if (item.startsWith("##")) {
                                return (
                                    <h2
                                        key={index}
                                        className="text-2xl font-semibold text-[#1F2933] mt-8"
                                    >
                                        {item.replace("##", "").trim()}
                                    </h2>
                                );
                            }

                            if (item.startsWith("•")) {
                                return (
                                    <li key={index} className="ml-6 list-disc">
                                        {item.replace("•", "").trim()}
                                    </li>
                                );
                            }

                            return (
                                //   <p key={index}>
                                //     {item}
                                //   </p>
                                <p key={index}>
                                    {renderContent(item)}
                                </p>
                            );
                        })}
                    </div>


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
                            <Eye size={14} /> {blog.views}
                        </div>

                        <div
                            onClick={() => handleCopyLink(blog.slug, blog.category)}
                            className="flex items-center gap-1 border px-3 py-1 rounded-full cursor-pointer"
                        >
                            <Send size={14} />
                            {copied === blog.slug ? "Copied!" : "Share"}
                        </div>


                    </div>

                    {/* Info */}
                    <div className="space-y-4 text-sm">

                        <div>
                            <p className="text-gray-400 text-xs">Publication Date</p>
                            <p className="text-[#1F2933]">{blog.date}</p>
                        </div>

                        <div>
                            <p className="text-gray-400 text-xs">Category</p>
                            <p className="text-[#1F2933]">{blog.category}</p>
                        </div>

                        <div>
                            <p className="text-gray-400 text-xs">Reading Time</p>
                            <p className="text-[#1F2933]">{blog.readTime}</p>
                        </div>

                        <div>
                            <p className="text-gray-400 text-xs">Author</p>
                            <p className="text-[#1F2933]">"Glazia team"</p>
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