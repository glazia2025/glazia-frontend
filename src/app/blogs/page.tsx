import BlogsClient from "./BlogsClient";

export default async function BlogsPage() {
  const response = await fetch("https://api.glazia.in/api/blogs", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch blogs");
  }

  const blogs = await response.json();

  return <BlogsClient blogs={blogs} />;
}