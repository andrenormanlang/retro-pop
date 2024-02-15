import React from "react";
import parse from "html-react-parser";
import { Box, Heading, Text, useBreakpointValue } from "@chakra-ui/react";
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
		fontWeight: "bold",
		fontSize: "sm",
		color: "teal",
		textDecoration: "underline",
		_before: {
			content: '"• "',
			color: "red",
		},
		ml: 2, // Add margin if you want spacing between bullet and text
	};
	const b = {
		fontWeight: "bold",
		fontSize: "sm",
		color: "teal",
		ml: 2, // Add margin if you want spacing between bullet and text
	};
	const maxWidth = useBreakpointValue({ base: "300px", objectFit: "contain" });

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
						alt={alt || ""}
						src={src}
						effect="blur"
						placeholderSrc={placeholder}
						scrollPosition={scrollPosition}
						style={{
							height: "auto",
							width: "100%",
							maxWidth: maxWidth,
						}}

						srcSet={srcSet}
						// borderRadius="md"
						// 	boxSize={{ base: "100%", md: "600px" }}
						// 	objectFit="contain"
						// 	p={2}
						// 	src={imageUrl}
						// 	alt={`Cover of ${comic.name}`}
						// 	mb={{ base: 4, md: 0 }}
						// 	alignSelf={{ base: "center", md: "auto" }}
						// 	justifySelf={{ base: "center", md: "auto" }}
						// 	mx={{ base: "auto", md: 0 }}
					/>
				);
			} else if (domNode.name === "h2") {
				return (
					<Heading
						as="h2"
						size={{ base: "md", md: "lg" }}
						fontFamily="Libre Franklin"
						mt="1rem"
						mb="1rem"
						color="red"
					>
						{domNode.children[0].data}
					</Heading>
				);
			} else if (domNode.name === "h3") {
				return (
					<Heading
						as="h3"
						size={{ base: "md", md: "lg" }}
						fontFamily="Libre Franklin"
						mt="1rem"
						mb="1rem"
						color="red"
					>
						{domNode.children[0].data}
					</Heading>
				);
			} else if (domNode.name === "h4") {
				return (
					<Heading
						as="h3"
						size={{ base: "md", md: "md" }}
						fontFamily="Libre Franklin"
						mt="1rem"
						mb="1rem"
						color="red"
					>
						{domNode.children[0].data}
					</Heading>
				);
			} else if (domNode.name === "figcaption") {
				return (
					<Text
					fontSize={{ base: "0.9rem", md: "md" }}
						fontFamily="Libre Franklin"
						fontWeight="bold"
						mt="0.2rem"
						mb="1rem"
						pl="0.5rem"
						color="teal.300"
						textAlign="initial"
						minW="300px"
					>
						{domNode.children[0].data}
					</Text>
				);
			} else if (domNode.name === "p") {
				return (
					<Text mb="0.7rem" mt="0.5rem" fontSize={{ base: "0.9rem", md: "md" }}>
						{domNode.children.map((child, index) => {
							if (child.type === "text" && typeof child.data === "string") {
								return <React.Fragment key={index}>{child.data}</React.Fragment>;
							} else if (child.type === "tag" && child.name === "a" && child.attribs && child.children) {
								// Ensure that child.children[0].data is a string and that child.attribs.href exists
								const linkText =
									typeof child.children[0].data === "string" ? child.children[0].data : "";
								let href = child.attribs.href ? child.attribs.href : "#";
								if (href.startsWith('/')) {
									href = `https://comicvine.gamespot.com${href}`;
								  }
								if (href.startsWith('../../')) {
									href = `https://comicvine.gamespot.com/${href}`;
								  }
								return (
									<Box
										as="a"
										href={href}
										style={linkStyle}
										key={index}
										target="_blank"
										rel="noopener noreferrer"
										mb="1rem"
									>
										{linkText}
									</Box>
								);
							} else if (child.type === "tag" && child.name === "b" && child.attribs && child.children) {
								// Ensure that child.children[0].data is a string and that child.attribs.href exists
								const b =
									typeof child.children[0].data === "string" ? child.children[0].data : "";
								return (
									<Text
										as="b"
										key={index}
										style={{
											fontWeight: "bold",
		fontSize: "1.2rem",
		color: "steelblue",

										}}
										mb="1rem"
									>
										{b}
									</Text>
								);
							} else if (child.type === "tag" && child.children) {
								// Recursively parse any other type of tags, ensuring child.children is defined
								const innerContent =
									typeof child.children[0].data === "string" ? child.children[0].data : "";
								// @ts-ignore
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

	return <Box>{parsedContent}</Box>;
};

export default trackWindowScroll(ComicVineCharacterDescription);
