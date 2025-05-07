import { NextPage } from "next";
import HalftoneBackground from "@/components/HalftoneBackground";
import ComicsBuyWrapper from "@/components/comics-store/ComicsBuyWrapper";
import JsonLd from "@/components/JsonLd";

const HomePage: NextPage = () => {
	const organizationSchema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "Retro Pop Comics",
		url: "https://retro-pop-comics.com",
		logo: "https://retro-pop-comics.com/logo.svg",
		sameAs: [
			"https://twitter.com/retroPopComics",
			"https://facebook.com/retroPopComics",
			"https://instagram.com/retroPopComics",
		],
		contactPoint: {
			"@type": "ContactPoint",
			telephone: "+1-123-456-7890",
			contactType: "customer service",
		},
	};

	return (
		<>
			<JsonLd data={organizationSchema} />
			<HalftoneBackground>
				<ComicsBuyWrapper />
			</HalftoneBackground>
		</>
	);
};

export default HomePage;
