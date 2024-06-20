"use client";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Avatar,
  Container,
  Heading,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from "@chakra-ui/react";
import { useGetUsers } from "@/hooks/fetch-users/useGetUsers";
import { User } from "@/types/comics-store/user";
import { useState } from "react";

const UserListTable = () => {
  const { data, isLoading, isError, error } = useGetUsers();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);

  const sortedUsers = data ? [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  }) : [];

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

  if (!Array.isArray(data)) {
    return (
      <Center h="100vh">
        <Alert status="error">
          <AlertIcon />
          Unexpected data format
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
              Users List
            </Heading>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th onClick={() => requestSort("avatar_url")}>Avatar</Th>
					<Th textAlign="center" onClick={() => requestSort("registration date")}>Registration Date</Th>
                    <Th onClick={() => requestSort("full_name")}>Full Name</Th>
                    <Th onClick={() => requestSort("username")}>Username</Th>
                    <Th  onClick={() => requestSort("email")}>Email</Th>
					<Th textAlign="center" onClick={() => requestSort("last signed in")}>Last Signed In</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedUsers.map((user: User) => (
                    <Tr key={user.id}>
                      <Td>
                        <Avatar src={user.avatar_url} name={user.username} />
                      </Td>
					  <Td textAlign="center">{formatDate(user.created)}</Td>
                      <Td>{user.full_name}</Td>
                      <Td>{user.username}</Td>
                      <Td >{user.email}</Td>
					  <Td textAlign="center">{formatDate(user.last_sign_in)}</Td>
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

export default UserListTable;
