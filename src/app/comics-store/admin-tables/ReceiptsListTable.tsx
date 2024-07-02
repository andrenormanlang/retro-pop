'use client';

import { useGetReceipts } from "@/hooks/comic-table/useGetReceipts";
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
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

type Receipt = {
  id: string;
  user_id: string;
  order_id: number;
  total_amount: number;
  currency: string;
  items: Array<{ title: string; price: number; quantity: number }>;
  created_at: string;
  profiles: { id: string; username: string; email: string };
};

const ReceiptsListTable = () => {
  const { data: receipts, isLoading, isError, error } = useGetReceipts();
  const toast = useToast();
  const [localReceipts, setLocalReceipts] = useState<Receipt[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);

  useEffect(() => {
    if (receipts) {
      setLocalReceipts(receipts);
    }
  }, [receipts]);

  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((value, key) => value[key], obj);
  };

  const formatDate = (dateString: string) => {
    const dateOptions = { day: "2-digit", month: "2-digit", year: "2-digit" } as const;
    const timeOptions = { hour: "2-digit", minute: "2-digit" } as const;
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-GB", dateOptions)} ${date.toLocaleTimeString("en-GB", timeOptions)}`;
  };

  const sortedReceipts = localReceipts.sort((a, b) => {
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
  });

  const requestSort = (key: string) => {
    let direction = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
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
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton>
            <Heading as="h1" size="xl" mb={6} flex="1" textAlign="left">
              Receipts List
            </Heading>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th onClick={() => requestSort("id")} textAlign="center">Receipt ID</Th>
                    <Th onClick={() => requestSort("order_id")} textAlign="center">Order ID</Th>
                    <Th onClick={() => requestSort("created_at")} textAlign="center">Date of Receipt</Th>
                    <Th onClick={() => requestSort("profiles.username")} textAlign="center">User</Th>
                    <Th onClick={() => requestSort("profiles.email")} textAlign="center">Email</Th>
                    <Th onClick={() => requestSort("total_amount")} textAlign="center">Total Amount</Th>
                    <Th onClick={() => requestSort("currency")} textAlign="center">Currency</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedReceipts.map((receipt: Receipt) => (
                    <Tr key={receipt.id}>
                      <Td textAlign="center">{receipt.id}</Td>
                      <Td textAlign="center">{receipt.order_id}</Td>
                      <Td textAlign="center">{formatDate(receipt.created_at)}</Td>
                      <Td textAlign="center">{receipt.profiles?.username || "Unknown"}</Td>
                      <Td textAlign="center">{receipt.profiles?.email || "Unknown"}</Td>
                      <Td textAlign="center">{receipt.total_amount}</Td>
                      <Td textAlign="center">{receipt.currency}</Td>
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

export default ReceiptsListTable;
