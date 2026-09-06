import CategoryClient from "./CategoryClient";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const response = await fetch("https://api.glazia.in/api/blogs", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch blogs");
  }

  const blogs = await response.json();

  const filteredBlogs = blogs.filter(
    (b: any) => b.category.toLowerCase() === category.toLowerCase()
  );

  return (
    <CategoryClient
      blogs={filteredBlogs}
      category={category}
    />
  );
}