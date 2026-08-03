
import { getBlogs } from "@/services/blogService";
import CategoryClient from "./CategoryClient";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const blogs = await getBlogs();

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