// import blogs from "../app/blogs/data/blogs.json";

// import { db } from "../lib/firebase";

// import { doc, setDoc } from "firebase/firestore";

// async function uploadBlogs() {
//   try {
//     for (const blog of blogs) {
//       await setDoc(doc(db, "blogs", blog.slug), blog);

//       console.log(`Uploaded: ${blog.title}`);
//     }

//     console.log("All blogs uploaded successfully.");
//   } catch (err) {
//     console.error(err);
//   }
// }

// uploadBlogs();