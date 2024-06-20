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
} from "@chakra-ui/react";
import { useGetUsers } from "@/hooks/fetch-users/useGetUsers";
import { User } from "@/types/comics-store/user";

const UserListTable = () => {
  const { data, isLoading, isError, error } = useGetUsers();

  // Log the data to check its structure
  console.log('Fetched users data:', data);

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

  // Check if data is an array before mapping
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

  return (
    <Container maxW="container.xl" p={4}>
      <Heading as="h1" size="xl" mb={6}>
        User List
      </Heading>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Avatar</Th>
              <Th>Full Name</Th>
              <Th>Username</Th>
              <Th>Email</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((user: User) => (
              <Tr key={user.id}>
                <Td>
                  <Avatar src={user.avatar_url} name={user.username} />
                </Td>
                <Td>{user.full_name}</Td>
                <Td>{user.username}</Td>
                <Td>{user.email}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default UserListTable;
