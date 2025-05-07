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
import { useMemo, useState } from "react";
import SearchBar from "@/components/comics-store/search";
import { SortConfig, User } from "@/types/comics-store/user";

const UserListTable = () => {
	const { data = [], isLoading, isError, error } = useGetUsers();
	const [searchQuery, setSearchQuery] = useState("");
	const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

	const filteredUsers = useMemo(() => {
		return data.filter(
			(user: User) =>
				(user.username?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
				(user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
				(user.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
		);
	}, [data, searchQuery]);

	const sortedAndFilteredUsers = useMemo(() => {
		return [...filteredUsers].sort((a: User, b: User) => {
			if (!sortConfig) return 0;
			const aValue = a[sortConfig.key];
			const bValue = b[sortConfig.key];

			if (!aValue && !bValue) return 0;
			if (!aValue) return 1;
			if (!bValue) return -1;

			if (aValue < bValue) {
				return sortConfig.direction === "ascending" ? -1 : 1;
			}
			if (aValue > bValue) {
				return sortConfig.direction === "ascending" ? 1 : -1;
			}
			return 0;
		});
	}, [filteredUsers, sortConfig]);

	const requestSort = (key: keyof User) => {
		let direction: "ascending" | "descending" = "ascending";
		if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
			direction = "descending";
		}
		setSortConfig({ key, direction });
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "N/A";

		const date = new Date(dateString);
		const dateOptions = { day: "2-digit", month: "2-digit", year: "2-digit" } as const;
		const timeOptions = { hour: "2-digit", minute: "2-digit" } as const;
		return `${date.toLocaleDateString("en-GB", dateOptions)} ${date.toLocaleTimeString("en-GB", timeOptions)}`;
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
					{error instanceof Error ? error.message : "An error occurred"}
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
							Users List
						</Heading>
						<AccordionIcon />
					</AccordionButton>
					<AccordionPanel pb={4}>
						<SearchBar
							onSearch={setSearchQuery}
							searchQuery={searchQuery}
							totalResults={sortedAndFilteredUsers.length}
						/>

						<TableContainer>
							<Table variant="simple">
								<Thead>
									<Tr>
										<Th textAlign="center" onClick={() => requestSort("avatar_url")}>
											Avatar
										</Th>
										<Th textAlign="center" onClick={() => requestSort("created")}>
											Registration Date
										</Th>
										<Th textAlign="center" onClick={() => requestSort("full_name")}>
											Full Name
										</Th>
										<Th textAlign="center" onClick={() => requestSort("username")}>
											Username
										</Th>
										<Th textAlign="center" onClick={() => requestSort("email")}>
											Email
										</Th>
										<Th textAlign="center" onClick={() => requestSort("last_sign_in")}>
											Last Signed In
										</Th>
										<Th textAlign="center" onClick={() => requestSort("is_admin")}>
											Admin Status
										</Th>
									</Tr>
								</Thead>
								<Tbody>
									{sortedAndFilteredUsers.map((user: User) => (
										<Tr key={user.id}>
											<Td textAlign="center">
												<Avatar
													src={user.avatar_url || undefined}
													name={user.username || "N/A"}
												/>
											</Td>
											<Td textAlign="center">{formatDate(user.created)}</Td>
											<Td textAlign="center">{user.full_name || "No Name Provided"}</Td>
											<Td textAlign="center">{user.username || "No Username"}</Td>
											<Td textAlign="center">{user.email || "No Email"}</Td>
											<Td textAlign="center">{formatDate(user.last_sign_in)}</Td>
											<Td textAlign="center">{user.is_admin ? "Yes" : "No"}</Td>
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
