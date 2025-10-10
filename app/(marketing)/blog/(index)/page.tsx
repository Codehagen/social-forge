import { getBlurDataURL } from "@/lib/blog/images";
import { constructMetadata } from "@/lib/constructMetadata";
import BlogCard from "@/components/blog/blog-card";
import { allBlogPosts } from "content-collections";

export const metadata = constructMetadata({
  title: "Blogg – Advanti",
  description:
    "Fagartikler, kundehistorier og innsikt fra Advanti om næringseiendom i Nord-Norge.",
});

export default async function Blog() {
  const articles = await Promise.all(
    // order by publishedAt (desc)
    allBlogPosts
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map(async (post) => ({
        ...post,
        blurDataURL: await getBlurDataURL(post.image),
      }))
  );

  return articles.map((article, idx) => (
    <BlogCard key={article.slug} data={article} priority={idx <= 1} />
  ));
}
