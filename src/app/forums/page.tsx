'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Box, Spinner, SimpleGrid, Heading, Text, Button, Image, VStack, Center, Container, useColorModeValue } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { Forum } from "@/types/forum/forum.type";

const ForumList = () => {
    const [forums, setForums] = useState<Forum[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const cardBg = useColorModeValue('white', 'gray.700');
    const cardText = useColorModeValue('gray.800', 'white');
    const cardHover = useColorModeValue('gray.100', 'gray.600');
    const cardBorder = useColorModeValue('gray.200', 'gray.500');

    useEffect(() => {
        const fetchForums = async () => {
            const { data, error } = await supabase.from("forums").select("*");
            if (error) console.error("Error fetching forums:", error);
            else setForums(data);
            setLoading(false);
        };

        fetchForums();
    }, []);

    if (loading) return (
        <Center height="100vh">
            <Spinner size="xl" />
        </Center>
    );

    return (
        <Container maxW="container.xl" py={8}>
            {/* <Heading mb={8} textAlign="center">Forums</Heading> */}
            <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing={6}>
                {forums.map((forum) => (
                    <Box key={forum.id} p={5} shadow="md" borderWidth="1px" borderRadius="md" overflow="hidden" bg={cardBg} _hover={{ shadow: "xl", bg: cardHover }} transition="all 0.3s ease-in-out">
                        <VStack spacing={4} align="stretch">
                            <Image
                                borderRadius="md"
                                src={forum.image || 'https://via.placeholder.com/400x200?text=Forum'} // Use the image from the forum or a placeholder
                                alt={forum.title}
                                objectFit="cover"
                                fallbackSrc="https://via.placeholder.com/400x200?text=Forum"
                            />
                            <Heading fontSize="xl">{forum.title}</Heading>
                            <Text>{forum.description}</Text>
                            <Button colorScheme="teal" onClick={() => router.push(`/forum/${forum.id}`)}>
                                View Topics
                            </Button>
                        </VStack>
                    </Box>
                ))}
            </SimpleGrid>
        </Container>
    );
};

export default ForumList;
