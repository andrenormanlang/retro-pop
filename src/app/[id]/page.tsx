'use client'

import { Box, Container, Heading } from '@chakra-ui/react';
import { NextPage } from 'next';
import ComicDetail from '../comics-store/buy/[id]/page';


const DetailPage: NextPage = () => {
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
