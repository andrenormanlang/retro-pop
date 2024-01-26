import { Box, Button, Stack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ComicsPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const ComicsPagination: React.FC<ComicsPaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const router = useRouter();

  useEffect(() => {
    if (currentPage > 65977) {
      onPageChange(65977);
      router.push('/issues?page=65977');
    }
  }, [currentPage, onPageChange, router]);

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const goToLastPage = () => {
    const lastPage = 65977; // Set the last page number directly
    onPageChange(lastPage);
  };

  return (
    <Stack direction="row" spacing={2} align="center" justify="center" my="1rem">
      <Button onClick={() => onPageChange(1)} disabled={currentPage === 0}>
        First
      </Button>
      <Button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}>
        Previous
      </Button>
      {Array.from({ length: totalPages }).map((_, index) => (
        <Button
          key={index + 1}
          onClick={() => onPageChange(index + 1)}
          colorScheme={currentPage === index ? 'blue' : 'gray'}
          variant={currentPage === index ? 'solid' : 'outline'}
        >
          {index + 1}
        </Button>
      ))}
      {currentPage < 65977 && (
        <>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            colorScheme={currentPage === totalPages - 1 ? 'gray' : 'blue'}
            variant="solid"
          >
            Next
          </Button>
          <Button
            onClick={goToLastPage}
            disabled={currentPage === totalPages - 1}
            colorScheme={currentPage === totalPages - 1 ? 'gray' : 'blue'}
            variant="solid"
          >
            Last
          </Button>
        </>
      )}
      {currentPage === 65977 && <Box>This is the last page</Box>}
    </Stack>
  );
};

export default ComicsPagination;

