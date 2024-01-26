import {
	Image,
	Text,
	Flex,
	Container,
  } from "@chakra-ui/react";

  import getRandomCover from "@/helpers/getRandomCover";

  export default async function HomePage() {
	const cover = await getRandomCover()

	return (
	  <Container maxW="container.xl" centerContent p={4}>
		{cover && (
		  <Flex
			p={4}
			borderRadius="md"
			direction="column"
			align="center"
			justify="center"
		  >
			<Text fontWeight="bold" fontSize="2rem" mt={2} fontFamily="Bangers" letterSpacing="0.2rem" color="red">
			  RANDOM COVER!
			</Text>
			<Text fontWeight="bold" fontSize="1.5rem" mt={2} fontFamily="Bangers" letterSpacing="0.2rem" color="white">
			  {cover.title}
			</Text>
			<Image
			  src={cover.coverPage}
			  alt={`Random Comic Book Cover: ${cover.title}`}
			  boxSize="400px"
			  objectFit="contain"
			/>
		  </Flex>
		)}
	  </Container>
	);
  };
