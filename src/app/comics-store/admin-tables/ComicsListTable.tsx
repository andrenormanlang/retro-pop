"use client";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
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
  Input,
  Button,
  HStack,
  Checkbox,
  CheckboxGroup,
  Flex,
} from "@chakra-ui/react";
import { useGetComics } from "@/hooks/comic-table/useGetComics";
import { Comic } from "@/types/comics-store/comic-detail.type";
import { supabase } from "@/utils/supabaseClient";
import { useState, useEffect } from "react";
import { useUpdateComics } from "@/hooks/comic-table/useUpdateComics";

type SortConfigKey = keyof Comic | "profiles.username" | "profiles.email";

const ComicsListTable = () => {
  const { data: comics, isLoading, isError, error } = useGetComics();
  const toast = useToast();
  const [localComics, setLocalComics] = useState<Comic[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortConfigKey; direction: string } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "title",
    "release_date",
    "profiles.username",
    "profiles.email",
    "created_at",
    "updated_at",
    "stock",
    "price",
    "is_approved",
  ]);
  const updateStockAndPriceMutation = useUpdateComics();

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
    return path.split(".").reduce((value, key) => value[key], obj);
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

  const handleUpdateStockAndPrice = (comicId: string, newStock: number, newPrice: number) => {
    updateStockAndPriceMutation.mutate(
      { comicId, newStock, newPrice },
      {
        onSuccess: () => {
          toast({
            title: "Stock and Price updated.",
            description: "The stock and price have been updated successfully.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        },
        onError: () => {
          toast({
            title: "Error updating stock and price.",
            description: "There was an error updating the stock and price.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        },
      }
    );
  };

  const formatDateRelease = (dateString: string) => {
    const date = new Date(dateString);
    const monthOptions: Intl.DateTimeFormatOptions = { month: "short" };
    const yearOptions: Intl.DateTimeFormatOptions = { year: "numeric" };
    const month = date.toLocaleDateString("en-GB", monthOptions);
    const year = date.toLocaleDateString("en-GB", yearOptions);
    return `${month} / ${year}`;
  };

  const formatDate = (dateString: string) => {
    const dateOptions = { day: "2-digit", month: "2-digit", year: "2-digit" } as const;
    const timeOptions = { hour: "2-digit", minute: "2-digit" } as const;
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-GB", dateOptions)} ${date.toLocaleTimeString("en-GB", timeOptions)}`;
  };

  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns((prev) =>
      prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]
    );
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
  return (
    <Box maxW="1300px" mx="auto" p={4}>
      <Accordion allowToggle defaultIndex={[0]}>
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
                    <Th colSpan={8}>
                      <CheckboxGroup colorScheme="blue" defaultValue={visibleColumns}>
                        <HStack spacing={4}>
                          <Checkbox isChecked={visibleColumns.includes("title")} onChange={() => toggleColumnVisibility("title")}>Title</Checkbox>
                          <Checkbox isChecked={visibleColumns.includes("release_date")} onChange={() => toggleColumnVisibility("release_date")}>Release Date</Checkbox>
                          <Checkbox isChecked={visibleColumns.includes("profiles.username")} onChange={() => toggleColumnVisibility("profiles.username")}>User</Checkbox>
                          <Checkbox isChecked={visibleColumns.includes("profiles.email")} onChange={() => toggleColumnVisibility("profiles.email")}>Email</Checkbox>
                          <Checkbox isChecked={visibleColumns.includes("created_at")} onChange={() => toggleColumnVisibility("created_at")}>Date / Time Added</Checkbox>
                          <Checkbox isChecked={visibleColumns.includes("updated_at")} onChange={() => toggleColumnVisibility("updated_at")}>Date / Time Updated</Checkbox>
                          <Checkbox isChecked={visibleColumns.includes("stock")} onChange={() => toggleColumnVisibility("stock")}>Stock</Checkbox>
                          <Checkbox isChecked={visibleColumns.includes("price")} onChange={() => toggleColumnVisibility("price")}>Price</Checkbox>
                          <Checkbox isChecked={visibleColumns.includes("is_approved")} onChange={() => toggleColumnVisibility("is_approved")}>Approve</Checkbox>
                        </HStack>
                      </CheckboxGroup>
                    </Th>
                  </Tr>
                  <Tr>
                    {/* {visibleColumns.includes("title") && <Th textAlign="left" onClick={() => requestSort("title")} position="sticky" left={0} bg="black" zIndex={1}>Title</Th>} */}
                    {visibleColumns.includes("title") && <Th textAlign="left" onClick={() => requestSort("title")}>Title</Th>}
                    {visibleColumns.includes("release_date") && <Th textAlign="center" onClick={() => requestSort("release_date")}>Release Date</Th>}
                    {visibleColumns.includes("profiles.username") && <Th textAlign="center" onClick={() => requestSort("profiles.username")}>User</Th>}
                    {visibleColumns.includes("profiles.email") && <Th textAlign="center" onClick={() => requestSort("profiles.email")}>Email</Th>}
                    {visibleColumns.includes("created_at") && <Th textAlign="center" onClick={() => requestSort("created_at")}>Date / Time Added</Th>}
                    {visibleColumns.includes("updated_at") && <Th textAlign="center" onClick={() => requestSort("updated_at")}>Date / Time Updated</Th>}
                    {visibleColumns.includes("stock") && <Th textAlign="center">Stock</Th>}
                    {visibleColumns.includes("price") && <Th textAlign="center">Price</Th>}
                    {visibleColumns.includes("is_approved") && <Th textAlign="center">Approve</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedComics.map((comic: Comic) => (
                    <Tr key={comic.id}>
                      {/* {visibleColumns.includes("title") && <Td textAlign="initial" position="sticky" left={0} bg="black" zIndex={1}>{comic.title}</Td>} */}
                      {visibleColumns.includes("title") && <Td textAlign="initial">{comic.title}</Td>}
                      {visibleColumns.includes("release_date") && <Td textAlign="center">{formatDateRelease(comic.release_date)}</Td>}
                      {visibleColumns.includes("profiles.username") && <Td textAlign="center">{comic.profiles?.username || "Unknown"}</Td>}
                      {visibleColumns.includes("profiles.email") && <Td textAlign="center">{comic.profiles?.email || "Unknown"}</Td>}
                      {visibleColumns.includes("created_at") && <Td textAlign="center">{formatDate(comic.created_at)}</Td>}
                      {visibleColumns.includes("updated_at") && <Td textAlign="center">{formatDate(comic.updated_at)}</Td>}
                      {visibleColumns.includes("stock") && (
                        <Td textAlign="center">
                          <HStack>
                            <Input
                              size="sm"
                              value={comic.stock}
                              onChange={(e) => setLocalComics(
                                localComics.map((item) =>
                                  item.id === comic.id
                                    ? { ...item, stock: parseInt(e.target.value, 10) }
                                    : item
                                )
                              )}
                              width="60px"
                              textAlign="center"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStockAndPrice(
                                comic.id,
                                localComics.find((item) => item.id === comic.id)?.stock || comic.stock,
                                comic.price
                              )}
                            >
                              Update
                            </Button>
                          </HStack>
                        </Td>
                      )}
                      {visibleColumns.includes("price") && (
                        <Td textAlign="center">
                          <HStack>
                            <Input
                              size="sm"
                              value={comic.price}
                              onChange={(e) => setLocalComics(
                                localComics.map((item) =>
                                  item.id === comic.id
                                    ? { ...item, price: parseFloat(e.target.value) }
                                    : item
                                )
                              )}
                              width="60px"
                              textAlign="center"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStockAndPrice(
                                comic.id,
                                comic.stock,
                                localComics.find((item) => item.id === comic.id)?.price || comic.price
                              )}
                            >
                              Update
                            </Button>
                          </HStack>
                        </Td>
                      )}
                      {visibleColumns.includes("is_approved") && (
                        <Td textAlign="center">
                          <Switch
                            isChecked={comic.is_approved}
                            onChange={() => toggleApproval(comic)}
                          />
                        </Td>
                      )}
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

