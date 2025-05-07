"use client";

import { Box, Container, Heading } from "@chakra-ui/react";
import { NextPage } from "next";
import ComicDetail from "../comics-store/buy/[id]/page";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

function isValidUUID(uuid: string) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

const DetailPage: NextPage = () => {
	const params = useParams();
	const id = typeof params === "object" && params !== null ? (params as any).id : undefined;

	if (!id || !isValidUUID(id)) {
		notFound();
	}

	return (
		<Container maxW="container.xl" p={4}>
			<Heading as="h1" size="xl" mb={6}>
				{/* Welcome to RetroPop! */}
			</Heading>
			<Box>
				{/* ComicsBuy Component as a Child Component */}
				<ComicDetail />
			</Box>
		</Container>
	);
};

export default DetailPage;
