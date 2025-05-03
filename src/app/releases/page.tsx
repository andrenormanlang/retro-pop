import React, { Suspense } from "react";
import MetronReleasesClient from "@/components/MetronReleasesClient";
import { Spinner, Center } from "@chakra-ui/react";

const ReleasesPage = () => {
	return (
		<Suspense
			fallback={
				<Center height="100vh">
					<Spinner size="xl" />
				</Center>
			}
		>
			<MetronReleasesClient />
		</Suspense>
	);
};

export default ReleasesPage;
