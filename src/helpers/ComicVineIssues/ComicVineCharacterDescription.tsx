import React from "react";
import parse from "html-react-parser";
import { Box, Heading, Text } from "@chakra-ui/react";
import { LazyLoadImage, trackWindowScroll, ScrollPosition } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css"; // Import the CSS for blur effect

interface ComicVineCharacterDescriptionProps {
	content: string; // Replace 'any' with 'string' if 'content' is expected to be a string
	scrollPosition: ScrollPosition; // Replace 'any' with 'number' or the correct type for scrollPosition
}

interface DomNodeChild {
	type: string;
	data?: string;
	// Add these properties if a DomNodeChild can be an element with attributes and children
	name?: string;
	attribs?: {
	  [key: string]: string | undefined;
	  href?: string;
	};
	children?: DomNodeChild[];
  }

interface DomNode {
	name: string;
	attribs: {
		[key: string]: string | undefined; // Allow for undefined values
		src?: string;
		alt?: string;
		"data-src"?: string;
		"data-placeholder"?: string;
		"data-srcset"?: string;
	};
	children: DomNodeChild[];
}

const ComicVineCharacterDescription: React.FC<ComicVineCharacterDescriptionProps> = ({ content, scrollPosition }) => {
	const linkStyle = {
		color: "teal.500",
		textDecoration: "underline",
		_before: {
			content: '"• "',
			color: "gray.500",
		},
		ml: 2, // Add margin if you want spacing between bullet and text
	};

	const figcaptionStyle = {
		fontSize: "sm",
		color: "gray.500",
		mt: 2,
	};
	const options = {
		replace: (domNode: DomNode) => {
			if (domNode.name === "img" && domNode.attribs["data-src"]) {
				const {
					alt,
					"data-src": dataSrc,
					"data-placeholder": dataPlaceholder,
					"data-srcset": dataSrcset,
				} = domNode.attribs; // Since these values could be undefined, provide a default or handle the undefined case
				const src = dataSrc || ""; // Provide a default empty string if undefined
				const placeholder = dataPlaceholder || "path_to_your_placeholder_image"; // Provide a default placeholder image
				const srcSet = dataSrcset || ""; // Provide a default empty string if undefined
				return (
					<LazyLoadImage
						alt={alt || ""} // Provide a default empty string if undefined
						height="auto"
						src={src}
						effect="blur"
						placeholderSrc={placeholder}
						scrollPosition={scrollPosition}
						width="320px"
						style={{ maxWidth: "100%", height: "auto" }}
						srcSet={srcSet}
					/>
				);
			} else if (domNode.name === "h2") {
				return (
					<Heading as="h2" size="lg" fontFamily="Bangers" mt="1rem" mb="1rem">
						{domNode.children[0].data}
					</Heading>
				);
			} else if (domNode.name === "p") {
				return (
				  <Text mb="0.5rem">
					{domNode.children.map((child, index) => {
					  if (child.type === "text" && typeof child.data === "string") {
						return <React.Fragment key={index}>{child.data}</React.Fragment>;
					  } else if (child.type === "tag" && child.name === "a") {
						// Ensure that child.children[0].data is a string
						const linkText = typeof child.children[0].data === "string" ? child.children[0].data : '';
						return (
						  <Box as="a" href={child.attribs.href} style={linkStyle} key={index}>
							{linkText}
						  </Box>
						);
					  } else if (child.type === "tag") {
						// Recursively parse any other type of tags
						const innerContent = typeof child.children[0].data === "string" ? child.children[0].data : '';
						return parse(innerContent, options);
					  }
					})}
				  </Text>
				);
			  }
			 // If no specific replacement is needed, return undefined to let html-react-parser handle the node as usual
			 return undefined;
		},
	};

	// @ts-ignore
	const parsedContent = parse(content, options);

	return <Box p={0}>{parsedContent}</Box>;
};

export default trackWindowScroll(ComicVineCharacterDescription);
