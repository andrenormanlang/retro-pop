import { NextPage } from "next";
import HalftoneBackground from "@/components/HalftoneBackground";
import ComicsBuyWrapper from "@/components/comics-store/ComicsBuyWrapper";

const HomePage: NextPage = () => {
	return (
		<HalftoneBackground>
			<ComicsBuyWrapper />
		</HalftoneBackground>
	);
};

export default HomePage;
