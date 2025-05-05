import { Input, Button, Stack, Flex, Box, useColorModeValue } from "@chakra-ui/react";
import { FormEvent, useState } from "react";

type SearchComponentProps = {
	onSearch: (term: string) => void;
};

const SearchBox: React.FC<SearchComponentProps> = ({ onSearch }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const bgColor = useColorModeValue("white", "gray.700");
	const borderColor = useColorModeValue("gray.300", "gray.600");

	const handleSearch = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onSearch(searchTerm);
		if (typeof window !== "undefined") {
			const searchParams = new URLSearchParams(window.location.search);
			searchParams.set("query", searchTerm);
			window.history.pushState(null, "", "?" + searchParams.toString());
		}
	};

	return (
		<Flex justify="center" width="100%" mb={8}>
			<Box width={{ base: "90%", sm: "80%", md: "60%", lg: "40%" }}>
				<form onSubmit={handleSearch} style={{ width: "100%" }}>
					<Stack direction="row" spacing={4} width="100%" align="center">
						<Input
							type="text"
							placeholder="Search..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							bg={bgColor}
							borderColor={borderColor}
							_hover={{ borderColor: "blue.500" }}
							_focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
						/>
						<Button type="submit" colorScheme="blue" minW="100px">
							Search
						</Button>
					</Stack>
				</form>
			</Box>
		</Flex>
	);
};

export default SearchBox;
