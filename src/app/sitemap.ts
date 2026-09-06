import { MetadataRoute } from "next";
// import { getBlogs } from "@/services/blogService";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // const blogs = await getBlogs();
  const response = await fetch("https://api.glazia.in/api/blogs", {
  cache: "no-store",
});

if (!response.ok) {
  throw new Error("Failed to fetch blogs");
}

const blogs = await response.json();


  const blogUrls: MetadataRoute.Sitemap = blogs.map((blog: any) => ({
    url: `https://glazia.in/blogs/${blog.category.toLowerCase()}/${blog.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: "https://glazia.in",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://glazia.in/categories/aluminium-profiles",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://glazia.in/categories/hardware",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://glazia.in/categories/railings",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://glazia.in/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://glazia.in/quotation",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://glazia.in/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...blogUrls,
  ];
}