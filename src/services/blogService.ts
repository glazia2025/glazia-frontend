import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export type Blog = {
  id: string;
  title: string;
  slug: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
  views: number;
  likes: number;
  comments: number;
  share: number;
  content: string[];
};

export const getBlogs = async (): Promise<Blog[]> => {
  const snapshot = await getDocs(collection(db, "blogs"));

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    delete data.createdAt;
    delete data.updatedAt;

    return {
      id: doc.id,
      ...(data as Omit<Blog, "id">),
    };
  });
};
export const getBlogBySlug = async (
  slug: string,
): Promise<Blog | null> => {
  const q = query(
    collection(db, "blogs"),
    where("slug", "==", slug),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
const data = snapshot.docs[0].data();

delete data.createdAt;
delete data.updatedAt;

return {
  id: snapshot.docs[0].id,
  ...(data as Omit<Blog, "id">),
};
};