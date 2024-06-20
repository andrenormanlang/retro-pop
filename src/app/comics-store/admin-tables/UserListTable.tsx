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
  Avatar,
  Container,
  Heading,
  Spinner,
  Center,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";

const UserListTable = () => {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  type SupabaseError = {
    message: string;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch user profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url");

        if (profileError) throw profileError;

        // Fetch user emails from the authentication service
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) throw authError;

        // Merge the data based on user ID
        const mergedData = profileData.map((profile: any) => {
          const authUser = authData.users.find((user: User) => user.id === profile.id);
          return {
            ...profile,
            email: authUser ? authUser.email : null,
          };
        });

        setUsers(mergedData);
      } catch (error) {
        setError((error as SupabaseError).message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
            {users.map((user) => (
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
