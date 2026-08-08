import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/services/blogService";
import BlogDetail from "./BlogDetailPage";

type Props = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { category, slug } = await params;

  // const blog = blogs.find(
  //   (b) =>
  //     b.slug === slug &&
  //     b.category.toLowerCase() === category.toLowerCase()
  // );
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog Not Found | Glazia",
    };
  }

  return {
    title: `${blog.title} | Glazia`,
    // description: blog.content[0],
    description: blog.content?.[0] ?? "",
     alternates: {
    canonical: `https://www.glazia.in/blogs/${category}/${slug}`,
  },
  openGraph: {
    title: `${blog.title} | Glazia`,
    // description: blog.content[0],
    description: blog.content?.[0] ?? "",
    url: `https://www.glazia.in/blogs/${category}/${slug}`,
    images: [
      {
        url: blog.image,
        width: 1200,
        height: 630,
        alt: blog.title,
      },
    ],
    type: "article",
  },

  twitter: {
    card: "summary_large_image",
    title: `${blog.title} | Glazia`,
    // description: blog.content[0],
    description: blog.content?.[0] ?? "",
    images: [blog.image],
  },
  };
  
}

export default async function Page({ params }: Props) {
  const { category, slug } = await params;

  // const blog = blogs.find(
  //   (b) =>
  //     b.slug === slug &&
  //     b.category.toLowerCase() === category.toLowerCase()
  // );
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  // return <BlogDetailPage />;
  return <BlogDetail blog={blog} />;
}