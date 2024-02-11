import React from "react";
import parse from "html-react-parser";
import { Box } from "@chakra-ui/react";
import { LazyLoadImage, trackWindowScroll, ScrollPosition } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css"; // Import the CSS for blur effect

interface ComicVineCharacterDescriptionProps {
	content: string; // Replace 'any' with 'string' if 'content' is expected to be a string
	scrollPosition: ScrollPosition; // Replace 'any' with 'number' or the correct type for scrollPosition
}

interface DomNode {
	name: string;
	attribs: {
		[key: string]: string;
		src: string;
		alt: string;
	};
}

const ComicVineCharacterDescription: React.FC<ComicVineCharacterDescriptionProps> = ({ content, scrollPosition }) => {

	const options = {
		replace: (domNode: DomNode) => {
			if (domNode.name === "img" && domNode.attribs["data-src"]) {
				const attribs = domNode.attribs as { [key: string]: string; src: string; alt: string };
				return (
					<LazyLoadImage
					alt={attribs.alt}
					height="auto"
					src={attribs["data-src"]}
					effect="blur"
					placeholderSrc={attribs["data-placeholder"] ?? "path_to_your_placeholder_image"}
					scrollPosition={scrollPosition}
					width="320px"
					style={{ maxWidth: '100%', height: 'auto' }}
					srcSet={attribs["data-srcset"]}

					/>
				);
			}
		},
	};

	// @ts-ignore
	const parsedContent = parse(content, options);


	return <Box p={8}>{parsedContent}</Box>;
};

export default trackWindowScroll(ComicVineCharacterDescription);
