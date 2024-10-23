import React, { Suspense } from "react";
import MarvelEventsClient from "@/components/MarvelEventsClients";
import { Spinner, Center } from "@chakra-ui/react";

const MarvelEvents = () => {
  return (
    <Suspense
      fallback={
        <Center height="100vh">
          <Spinner size="xl" />
        </Center>
      }
    >
      <MarvelEventsClient />
    </Suspense>
  );
};

export default MarvelEvents;
