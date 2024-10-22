import React from 'react';
import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';  // Correct import

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const ComicSpinner = () => {
  return (
    <Box
      as="div"
      display="inline-block"
      width="80px"
      height="80px"
      border="8px solid rgba(255, 255, 255, 0.3)"
      borderRadius="50%"
      borderTop="8px solid teal"
      animation={`${spin} 2s linear infinite`}
      style={{
        backgroundImage: 'url("/path-to-your-comic-image.png")', // Add a comic image to the center
        backgroundSize: '50%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    />
  );
};

export default ComicSpinner;
