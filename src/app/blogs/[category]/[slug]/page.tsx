import { notFound } from "next/navigation";
import BlogDetail from "./BlogDetailPage";

type Props = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { category, slug } = await params;

  const response = await fetch(
    `https://api.glazia.in/api/blogs?slug=${encodeURIComponent(slug)}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return {
      title: "Blog Not Found | Glazia",
    };
  }

  const blogs = await response.json();

  const blog = blogs.find(
    (b: any) =>
      b.slug === slug &&
      b.category.toLowerCase() === category.toLowerCase()
  );

  if (!blog) {
    return {
      title: "Blog Not Found | Glazia",
    };
  }

  return {
    title: `${blog.title} | Glazia`,
    description: blog.content?.[0] ?? "",
    alternates: {
      canonical: `https://www.glazia.in/blogs/${category}/${slug}`,
    },
    openGraph: {
      title: `${blog.title} | Glazia`,
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
      description: blog.content?.[0] ?? "",
      images: [blog.image],
    },
  };
}

export default async function Page({ params }: Props) {
  const { category, slug } = await params;

  const response = await fetch("https://api.glazia.in/api/blogs", {
    cache: "no-store",
  });

  if (!response.ok) {
    notFound();
  }

  const blogs = await response.json();

  const blog = blogs.find(
    (b: any) =>
      b.slug === slug &&
      b.category.toLowerCase() === category.toLowerCase()
  );

  if (!blog) {
    notFound();
  }

  return <BlogDetail blog={blog} />;
}