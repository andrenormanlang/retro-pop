"use client";

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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from "@chakra-ui/react";
import { useGetComics } from "@/hooks/comic-table/useGetComics";
import { Comic } from "@/types/comics-store/comic-detail.type";
import { supabase } from "@/utils/supabaseClient";
import { useState, useEffect } from "react";

type SortConfigKey = keyof Comic | 'profiles.username' | 'profiles.email';

const ComicsListTable = () => {
  const { data: comics, isLoading, isError, error } = useGetComics();
  const toast = useToast();
  const [localComics, setLocalComics] = useState<Comic[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortConfigKey; direction: string } | null>(null);

  useEffect(() => {
    if (comics) {
      setLocalComics(comics);
    }
  }, [comics]);

  const sortedComics = localComics
    ? [...localComics].sort((a, b) => {
        if (!sortConfig) return 0;
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      })
    : [];

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((value, key) => value[key], obj);
  };

  const requestSort = (key: SortConfigKey) => {
    let direction = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const toggleApproval = async (comic: Comic) => {
    const updatedComics = localComics.map((item) =>
      item.id === comic.id ? { ...item, is_approved: !item.is_approved } : item
    );
    setLocalComics(updatedComics);

    try {
      const { error } = await supabase
        .from("comics-sell")
        .update({ is_approved: !comic.is_approved })
        .eq("id", comic.id);

      if (error) {
        // Revert the change in case of an error
        setLocalComics(localComics);
        throw error;
      }

      const isApproved = !comic.is_approved;

      toast({
        title: isApproved ? "Comic approved." : "Comic disapproved.",
        description: isApproved
          ? "The comic has been approved."
          : "The comic has been set to not approved.",
        status: isApproved ? "success" : "error",
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

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center h="100vh">
        <Alert status="error">
          <AlertIcon />
          {error.message}
        </Alert>
      </Center>
    );
  }

  const formatDate = (dateString: string) => {
    const dateOptions = { day: "2-digit", month: "2-digit", year: "2-digit" } as const;
    const timeOptions = { hour: "2-digit", minute: "2-digit" } as const;
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-GB", dateOptions)} ${date.toLocaleTimeString("en-GB", timeOptions)}`;
  };
  return (
    <Box maxW="1300px" mx="auto" p={4}>
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton>
            <Heading as="h1" size="xl" mb={6} flex="1" textAlign="left">
              Comics List
            </Heading>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th textAlign="left" onClick={() => requestSort("title")}>Title</Th>
                    <Th textAlign="center" onClick={() => requestSort("release_date")}>Release Date</Th>
                    <Th textAlign="center" onClick={() => requestSort("profiles.username")}>User</Th>
                    <Th textAlign="center" onClick={() => requestSort("profiles.email")}>Email</Th>
                    <Th textAlign="center" onClick={() => requestSort("created_at")}>Date Added</Th>
                    <Th textAlign="center" onClick={() => requestSort("updated_at")}>Date Updated</Th>
                    <Th textAlign="center">Approve</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedComics.map((comic: Comic) => (
                    <Tr key={comic.id}>
                      <Td textAlign="initial">{comic.title}</Td>
                      <Td textAlign="center">{formatDate(comic.release_date)}</Td>
                      <Td textAlign="center">{comic.profiles?.username || "Unknown"}</Td>
                      <Td textAlign="center">{comic.profiles?.email || "Unknown"}</Td>
                      <Td textAlign="center">{formatDate(comic.created_at)}</Td>
                      <Td textAlign="center">{formatDate(comic.updated_at)}</Td>
                      <Td textAlign="center">
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
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default ComicsListTable;

