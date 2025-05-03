import { Input, Button, Stack, Flex } from "@chakra-ui/react";
import { FormEvent, useState } from "react";

type SearchComponentProps = {
	onSearch: (term: string) => void;
};

const SearchBox: React.FC<SearchComponentProps> = ({ onSearch }) => {
	const [searchTerm, setSearchTerm] = useState("");

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
		<Flex justify="center" width="100%">
			<form onSubmit={handleSearch} style={{ width: "100%" }}>
				<Stack direction="row" spacing={4} width="100%" align="center" mb={5} position="relative" zIndex={5}>
					<Input
						type="text"
						placeholder="Search..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						flex={1}
					/>
					<Button type="submit" colorScheme="blue">
						Search
					</Button>
				</Stack>
			</form>
		</Flex>
	);
};

export default SearchBox;
