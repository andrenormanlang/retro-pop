import { Box, Image } from '@chakra-ui/react';

const RetroPopLogo = ({ size }: { size: { base: string, md: string } }) => {
  return (
    <Box width={size} height={size}>
      <Image src="/logo.svg" alt="RetroPop Logo" width="100%" height="100%" objectFit="contain" />
    </Box>
  );
};

export default RetroPopLogo;
