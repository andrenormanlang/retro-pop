import { Box, Heading, Text, Button, Center, VStack } from "@chakra-ui/react";
import Link from "next/link";

export default function NotFound() {
	return (
		<Center h="100vh">
			<VStack spacing={6}>
				<Heading as="h1" size="2xl">
					404
				</Heading>
				<Text fontSize="xl">Page Not Found</Text>
				<Text>We couldn&apos;t find the page you were looking for.</Text>
				<Link href="/" passHref>
					<Button colorScheme="blue">Return Home</Button>
				</Link>
			</VStack>
		</Center>
	);
}
