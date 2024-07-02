'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Box, Text, Heading, IconButton, useColorModeValue, useToast, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Tooltip } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import copy from 'copy-to-clipboard';
import withAuth from '@/utils/withAuth'; 

const AccessTokenDisplay = () => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const bg = useColorModeValue('gray.100', 'gray.700');
  const color = useColorModeValue('black', 'white');
  const toast = useToast();

  const handleCopy = () => {
    if (accessToken) {
      copy(accessToken);
      toast({
        title: 'Access Token Copied',
        description: 'The access token has been copied to your clipboard.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'No Access Token',
        description: 'There is no access token to copy.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      p={6}
      bg={bg}
      borderRadius="md"
      boxShadow="md"
      maxWidth="400px"
      mx="auto"
      mt={8}
      textAlign="center"
    >
      <Accordion allowToggle>
        <AccordionItem>
          <Heading as="h2" size="lg" mb={4} color={color}>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Access Token
              </Box>
              <Tooltip label="Copy Token" fontSize="md">
                <IconButton
                  aria-label="Copy access token"
                  icon={<CopyIcon />}
                  onClick={handleCopy}
                  colorScheme="teal"
                  variant="outline"
                  size="sm"
                  mr={2}
                />
              </Tooltip>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel pb={4}>
            <Text color={color} wordBreak="break-all">
              {accessToken || 'No access token available'}
            </Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default withAuth(AccessTokenDisplay);
