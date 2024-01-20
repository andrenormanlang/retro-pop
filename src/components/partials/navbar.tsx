'use client'

import {
  Box,
  Flex,
  Button,
  IconButton,
  Link,
  useDisclosure,
  Stack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import RetroPopLogo from './logo'; // Changed this line

export default function Nav() {
  const { isOpen, onToggle } = useDisclosure();

  const variants = {
    open: { opacity: 1, height: 'auto' },
    closed: { opacity: 0, height: 0 },
  };

  const buttonStyle = {
    width: '100%', // Set the width to 100% to ensure all buttons have the same width
    fontFamily: 'Bangers',
    color: 'white', // Set the font family to 'Bangers'
    letterSpacing: '0.2em'
  };

  const menuItems = [
    { name: 'Search Comics', href: '#search-comics' },
    { name: 'Shared Comics', href: '#shared-comics' },
    { name: 'Forums', href: '#forums' },

  ];

  return (
    <Box>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding="1.5rem"
        bg="black"
        color="white"
        border="1px solid"
      
      >
        <Flex align="center" mr={5}>
          <RetroPopLogo /> 
        </Flex>

        <Box display="block" onClick={onToggle}>
          {isOpen ? <CloseIcon boxSize={10}/> :<HamburgerIcon boxSize={10} />}
        </Box>

        <motion.div
          variants={variants}
          initial="closed"
          animate={isOpen ? 'open' : 'closed'}
          transition={{ duration: 0.1 }}
          style={{ width: '100%' }}
        >
          <Stack
            direction="column"
            display="flex"
            alignItems="center"
            mt={4}
            height='100vh'
          >
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                padding={2}
                rounded="md"
                fontFamily={'Bangers'}
                fontSize="xl" 
                letterSpacing= "0.1em"
                _hover={{
                  textDecoration: 'none',
                  bg: 'blue.700',
                }}
              >
                {item.name}
              </Link>
            ))}
             <Box mt={4}>
              <Button style={buttonStyle} bg="blue" border="1px">
                Register
              </Button>
            </Box>
            <Box mt={4}>
              <Button style={buttonStyle} bg="green" border="1px">
                Log in
              </Button>
            </Box>
            <Box mt={4}>
              <Button style={buttonStyle} bg="red" border="1px">
                Log Out
              </Button>
            </Box>
          </Stack>
        </motion.div>
      </Flex>
    </Box>
  );
}