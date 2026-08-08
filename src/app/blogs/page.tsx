import { getBlogs } from "@/services/blogService";
import BlogsClient from "./BlogsClient";

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return <BlogsClient blogs={blogs} />;
}