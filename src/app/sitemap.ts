import { MetadataRoute } from "next";
import { getBlogs } from "@/services/blogService";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await getBlogs();

  const blogUrls: MetadataRoute.Sitemap = blogs.map((blog) => ({
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