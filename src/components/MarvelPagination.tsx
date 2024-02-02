import { Box, Button } from '@chakra-ui/react';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MarvelPagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <Box display="flex" justifyContent="center" mt="8" p={4}>
      <Button
        onClick={() => onPageChange(1)}
        isDisabled={currentPage === 1}
      >
        First
      </Button>
      <Button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        isDisabled={currentPage === 1}
        mx={2}
      >
        Previous
      </Button>
      <Button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        isDisabled={currentPage === totalPages}
        mx={2}
      >
        Next
      </Button>
      <Button
        onClick={() => onPageChange(totalPages)}
        isDisabled={currentPage === totalPages}
      >
        Last
      </Button>
    </Box>
  );
};

export default MarvelPagination;
