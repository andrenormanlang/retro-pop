import React, { Suspense } from "react";
import { Spinner, Center } from "@chakra-ui/react";
import MetronIssuesClient from "@/components/MetronIssuesClient";

const MetronIssues = () => {
	return (
		<Suspense
			fallback={
				<Center height="100vh">
					<Spinner size="xl" />
				</Center>
			}
		>
			<MetronIssuesClient />
		</Suspense>
	);
};

export default MetronIssues;
