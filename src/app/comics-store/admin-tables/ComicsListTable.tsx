"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Container,
  Heading,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Switch,
  useToast,
} from "@chakra-ui/react";
import { supabase } from "@/utils/supabase/client";
import { Comic } from "@/types/comics-store/comic-detail.type";

const ComicsListTable = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  type SupabaseError = {
    message: string;
  };

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const { data, error } = await supabase
          .from("comics-sell")
          .select(`
            *
          `);

        if (error) throw error;

        setComics(data);
      } catch (error) {
        setError((error as SupabaseError).message);
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, []);

  const toggleApproval = async (comic: Comic) => {
    try {
      const { error } = await supabase
        .from("comics-sell")
        .update({ is_approved: !comic.is_approved })
        .eq("id", comic.id);

      if (error) throw error;

      setComics((prevComics) =>
        prevComics.map((item) =>
          item.id === comic.id ? { ...item, is_approved: !comic.is_approved } : item
        )
      );

      toast({
        title: comic.is_approved ? "Comic disapproved." : "Comic approved.",
        description: comic.is_approved
          ? "The comic has been set to not approved."
          : "The comic has been approved.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating comic.",
        description: "There was an error updating the comic.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" p={4}>
      <Heading as="h1" size="xl" mb={6}>
        Comics for Sale
      </Heading>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>User</Th>
              {/* <Th>Email</Th> */}
              <Th>Date Added</Th>
              <Th>Date Updated</Th>
              <Th>Approve</Th>
            </Tr>
          </Thead>
          <Tbody>
            {comics.map((comic) => (
              <Tr key={comic.id}>
                <Td>{comic.title}</Td>
                <Td>{comic.profiles?.username || "Unknown"}</Td>
                {/* <Td>{comic.profiles?.email || "Unknown"}</Td> */}
                <Td>{new Date(comic.created_at).toLocaleDateString()}</Td>
                <Td>{new Date(comic.updated_at).toLocaleDateString()}</Td>
                <Td>
                  <Switch
                    isChecked={comic.is_approved}
                    onChange={() => toggleApproval(comic)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ComicsListTable;
