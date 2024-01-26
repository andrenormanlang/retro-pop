import { Input, Button, Stack } from '@chakra-ui/react';
import { useState } from 'react';

type SearchComponentProps = {
  onSearch: (term: string) => void;
};

const SearchBox: React.FC<SearchComponentProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <Stack direction="row" spacing={6} width={400} align="center" mb={5} position={'relative'} zIndex={5}>
      <Input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button onClick={handleSearch}>Search</Button>
    </Stack>
  );
};

export default SearchBox;
