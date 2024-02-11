import { Input, Button, Stack } from "@chakra-ui/react";
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
		<form onSubmit={handleSearch}>
			<Stack
				direction="row"
				spacing={6}
				width={350}
				align="center"
				mb={5}
				position={"relative"}
				zIndex={5}
			>
				<Input
					type="text"
					placeholder="Search..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<Button type="submit">Search</Button>
			</Stack>
		</form>
	);
};

export default SearchBox;
