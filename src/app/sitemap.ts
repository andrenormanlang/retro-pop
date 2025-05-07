import { MetadataRoute } from "next";

type ChangeFrequency = "daily" | "weekly" | "always" | "hourly" | "monthly" | "yearly" | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Get your dynamic routes here (e.g., comics, blog posts)
	// const comics = await getComics() // Implement this function to fetch your comics
	// const posts = await getBlogPosts() // Implement this function to fetch blog posts

	// Base routes that we know exist
	const routes = [
		"",
		"/about",
		"/comics-store",
		"/blog",
		"/releases",
		"/forums",
		"/search/marvel/marvel-comics",
		"/search/marvel/marvel-characters",
		"/search/metron/metron-issues",
	].map((route): MetadataRoute.Sitemap[number] => ({
		url: `https://retro-pop-comics.com${route}`,
		lastModified: new Date(),
		changeFrequency: (route === "" ? "daily" : "weekly") as ChangeFrequency,
		priority: route === "" ? 1 : 0.8,
	}));

	// Add dynamic routes when implemented
	// const comicRoutes = comics.map((comic) => ({
	//   url: `https://retro-pop-comics.com/comics-store/${comic.id}`,
	//   lastModified: comic.updatedAt,
	//   changeFrequency: 'weekly' as ChangeFrequency,
	//   priority: 0.6,
	// }))

	return routes;
}
