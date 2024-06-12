// REDUX
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Link,
  useDisclosure,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  CloseIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import RetroPopLogo from "./logo";
import { MenuType, SubmenuType } from "@/types/navbar/nav.types";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setAvatarUrl } from "@/store/avatarSlice";
import AvatarNav from "../../helpers/AvatarNav";

const Navbar = () => {
  const supabase = createClient();
  const { isOpen, onToggle, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const [user, setUser] = useState<User | null>(null);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarUrl = useSelector((state: RootState) => state.avatar.url);
  const dispatch = useDispatch();
  const router = useRouter();

  const fetchUserProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", userId)
          .single();
        if (error) {
          throw error;
        }
        if (data && data.avatar_url) {
          dispatch(setAvatarUrl(data.avatar_url));
          console.log("Fetched avatar_url", data.avatar_url);
        } else {
          console.log("No avatar URL found");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    },
    [supabase, dispatch]
  );

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    };

    fetchUser();
  }, [supabase, fetchUserProfile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const handleOpenMainMenu = () => {
    setIsMainMenuOpen(true);
    onToggle();
  };

  const handleCloseMainMenu = () => {
    setIsMainMenuOpen(false);
    onToggle();
  };

  const handleToggleAvatarMenu = () => {
    setIsAvatarMenuOpen(!isAvatarMenuOpen);
  };

  const variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "-100%" },
  };

  const buttonStyle = {
    width: "100%",
    maxWidth: "310px",
    fontWeight: "700",
    fontFamily: "Bangers",
    fontSize: "1.3rem",
    letterSpacing: "0.2rem",
    color: "white",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    height: "2rem",
    my: "0.5rem",
    bg: "blue.500",
    borderRadius: "md",
    outline: "none",
    _hover: {
      bg: "blue.500",
      color: "white",
    },
    _active: {
      bg: "blue.700",
      color: "white",
    },
    _focus: {
      bg: "blue.600",
      boxShadow: "outline",
    },
  };

  const buttonAvatarStyle = {
    width: "100%",
    maxWidth: "310px",
    fontWeight: "400",
    fontFamily: "'Libre Franklin', sans-serif",
    fontSize: "1rem",
    color: "white",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    height: "1.5rem",
    my: "0.5rem",
    bg: "blue.500",
    borderRadius: "md",
    outline: "none",
    _hover: {
      bg: "blue.500",
      color: "white",
    },
    _active: {
      bg: "blue.700",
      color: "white",
    },
    _focus: {
      bg: "blue.600",
      boxShadow: "outline",
    },
  };

  const menuBgColor = useColorModeValue("white", "gray.800");
  const menuColor = useColorModeValue("black", "white");
  const menuItemHoverBg = useColorModeValue("gray.200", "gray.600");
  const menuItemFocusBg = useColorModeValue("gray.300", "gray.700");

  const customMenuListStyle = {
    borderColor: "gray.600",
    borderWidth: "0.5px",
    borderRadius: "md",
    boxShadow: "lg",
    minWidth: "5rem",
    width: "310px",
    bg: menuBgColor,
    color: menuColor,
    outline: "none",
    margin: "1",
    _hover: {
      bg: menuItemHoverBg,
    },
    _focus: {
      bg: menuItemFocusBg,
      outline: "none",
    },
  };

  const avatarMenuListStyle = {
    ...customMenuListStyle,
    width: "6rem",
  };

  const marvelButtonStyle = {
    ...buttonStyle,
    fontFamily: "'Libre Franklin', sans-serif",
    fontWeight: "900",
    textTransform: "uppercase",
    bg: "red.500",
    color: "white",
    padding: "1rem",
    letterSpacing: "-0.15rem",
  };

  const menuItems: MenuType[] = [
    {
      name: "Search",
      submenu: [
        {
          name: "Comic Vine",
          submenu: [
            { name: "Issues", href: "/search/comic-vine/issues" },
            { name: "Characters", href: "/search/comic-vine/characters" },
            { name: "Publishers", href: "/search/comic-vine/publishers" },
          ],
        },
        {
          name: "Characters",
          submenu: [
            { name: "Superheros API", href: "/search/superheros/superhero-api" },
            { name: "Superheros List", href: "/search/superheros/superheros-list" },
          ],
        },
        {
          name: "getcomics.org",
          submenu: [{ name: "Get Some!", href: "/search/comicbooks-api" }],
        },
        {
          name: "MARVEL",
          submenu: [
            { name: "Comics", href: "/search/marvel/marvel-comics" },
            { name: "Characters", href: "/search/marvel/marvel-characters" },
            { name: "Creators", href: "/search/marvel/marvel-creators" },
            { name: "Events", href: "/search/marvel/marvel-events" },
            { name: "Series", href: "/search/marvel/marvel-series" },
            { name: "Stories", href: "/search/marvel/marvel-stories" },
          ],
        },
      ],
    },
    {
      name: "Store",
      submenu: [
        { name: "Buy", href: "/store/buy" },
        { name: "Sell", href: "/store/sell" },
      ],
    },
  ];

  const renderMenuItem = (item: MenuType | SubmenuType, index: number | string) => (
    <Menu key={index}>
      <MenuButton as={Button} {...(item.name === "MARVEL" ? marvelButtonStyle : buttonStyle)}>
        {item.name}
      </MenuButton>
      <MenuList {...customMenuListStyle}>
        {item.submenu?.map((subItem, subIndex) =>
          subItem.submenu ? (
            // For items with further nested submenus (recursive call for deeper levels)
            renderMenuItem(subItem, `${index}-${subIndex}`)
          ) : (
            <Link key={subIndex} href={subItem.href} style={{ textDecoration: "none", width: "100%" }}>
              <MenuItem {...buttonStyle}>{subItem.name}</MenuItem>
            </Link>
          )
        )}
      </MenuList>
    </Menu>
  );

  const renderAvatarItem = (name: string, href?: string, onClick?: () => void) => (
    <Link href={href} onClick={onClick} style={{ textDecoration: "none", width: "100%" }}>
      <MenuItem {...buttonAvatarStyle}>{name}</MenuItem>
    </Link>
  );

  return (
    <Box as="nav" position="fixed" top="0" width={"100%"} zIndex={10}>
      <Flex
        justify="space-between"
        wrap="wrap"
        padding="1.5rem"
        bg="gray.800"
        color="white"
        px={{ base: "1rem", md: "6rem", lg: "8rem" }}
      >
        <Flex align="center" mr={5}>
          <Link href="/">
            <RetroPopLogo />
          </Link>
        </Flex>
        <Flex align="center">
          {/* Theme Toggle Button */}
          <IconButton aria-label="Toggle theme" icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />} onClick={toggleColorMode} mr={4} />

          {/* Hamburger Icon */}
          {!isMainMenuOpen && (
            <IconButton
              onClick={handleOpenMainMenu}
              aria-label="Open menu"
              icon={<HamburgerIcon boxSize={10} />}
              display={{ base: "block" }}
              zIndex="tooltip"
              mr={4}
            />
          )}

          {user && (
            <Flex align="center" ml={4}>
              <Menu isOpen={isAvatarMenuOpen} onOpen={handleToggleAvatarMenu} onClose={handleToggleAvatarMenu}>
                <MenuButton as={Box} position="relative" display="flex" alignItems="center">
                  <AvatarNav uid={user.id} size={50} />
                  <Box position="absolute" bottom="-15px" left="50%" transform="translateX(-50%)">
                    {isAvatarMenuOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
                  </Box>
                </MenuButton>
                <MenuList {...avatarMenuListStyle}>
                  {renderAvatarItem("profile", "/account")}
                  {renderAvatarItem("sign out", undefined, handleSignOut)}
                </MenuList>
              </Menu>
            </Flex>
          )}
        </Flex>
        {/* Motion div for the Hamburger Menu */}
        <motion.div
          variants={variants}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          transition={{ duration: 0.2 }}
          style={{
            display: isOpen ? "block" : "none",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1000,
            width: "100%",
            height: "100%",
            backgroundColor: "black",
          }}
        >
          {isOpen && (
            <IconButton
              onClick={handleCloseMainMenu}
              aria-label="Close menu"
              icon={<CloseIcon boxSize={5} />}
              position="absolute"
              top="1rem"
              right="1rem"
              zIndex="tooltip"
            />
          )}
          <Stack spacing={4} align="center" justify="center" pt="5rem">
            {menuItems.map((item, index) => (item.submenu ? renderMenuItem(item, index) : null))}
            {!user && (
              <>
                <Button as={Link} href="/login" {...buttonStyle}>
                  Login
                </Button>
                <Button as={Link} href="/signup" {...buttonStyle}>
                  Sign Up
                </Button>
              </>
            )}
          </Stack>
        </motion.div>
      </Flex>
    </Box>
  );
};

export default Navbar;


// WITH CONTEXT!
// 'use client';
// // components/Navbar.tsx
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   Box,
//   Flex,
//   Button,
//   IconButton,
//   Link,
//   useDisclosure,
//   useColorMode,
//   Menu,
//   MenuButton,
//   MenuList,
//   MenuItem,
//   Stack,
// } from "@chakra-ui/react";
// import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
// import { motion } from "framer-motion";
// import { createClient } from "@/utils/supabase/client";
// import RetroPopLogo from "./logo";
// import { MenuType, SubmenuType } from "@/types/navbar/nav.types";
// import { useRouter } from "next/navigation";
// import { User } from "@supabase/supabase-js";
// import AvatarNav from "../../helpers/AvatarNav";
// import { useAvatar } from "@/contexts/AvatarContext";

// const Navbar = () => {
//   const supabase = createClient();
//   const { isOpen, onToggle, onClose } = useDisclosure();
//   const { colorMode, toggleColorMode } = useColorMode();
//   const [user, setUser] = useState<User | null>(null);
//   const { avatarUrl, setAvatarUrl } = useAvatar();
//   const router = useRouter();

//   const fetchUserProfile = useCallback(
//     async (userId: string) => {
//       try {
//         const { data, error } = await supabase.from("profiles").select("avatar_url").eq("id", userId).single();
//         if (error) {
//           throw error;
//         }
//         if (data && data.avatar_url) {
//           setAvatarUrl(data.avatar_url);
//           console.log("Fetched avatar_url", data.avatar_url);
//         } else {
//           console.log("No avatar URL found");
//         }
//       } catch (error) {
//         console.error("Error fetching profile data:", error);
//       }
//     },
//     [supabase, setAvatarUrl]
//   );

//   useEffect(() => {
//     const fetchUser = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();
//       setUser(session?.user || null);
//       if (session?.user) {
//         fetchUserProfile(session.user.id);
//       }
//     };

//     fetchUser();
//   }, [supabase, fetchUserProfile]);

//   const handleSignOut = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//     router.push("/");
//   };

//   const variants = {
//     open: { opacity: 1, x: 0 },
//     closed: { opacity: 0, x: "-100%" },
//   };

//   const buttonStyle = {
//     width: "100%",
//     maxWidth: "300px",
//     fontWeight: "700",
//     fontFamily: "Bangers",
//     fontSize: "1.3rem",
//     letterSpacing: "0.2rem",
//     color: "white",
//     justifyContent: "center",
//     alignItems: "center",
//     display: "flex",
//     height: "2rem",
//     my: "0.5rem",
//     bg: "blue.500",
//     borderRadius: "md",
//     outline: "none",
//     _hover: {
//       bg: "blue.500",
//       color: "white",
//     },
//     _active: {
//       bg: "blue.700",
//       color: "white",
//     },
//     _focus: {
//       bg: "blue.600",
//       boxShadow: "outline",
//     },
//   };

//   const customMenuListStyle = {
//     borderColor: "gray.600",
//     borderWidth: "1px",
//     borderRadius: "md",
//     boxShadow: "lg",
//     minWidth: "200px",
//     fontSize: "10px",
//     color: "gray.800",
//     outline: "none",
//     margin: "1",
//     _hover: {
//       bg: "blue.600",
//     },
//     _focus: {
//       bg: "blue.700",
//       outline: "none",
//     },
//   };

//   const marvelButtonStyle = {
//     ...buttonStyle,
//     fontFamily: "'Libre Franklin', sans-serif",
//     fontWeight: "900",
//     textTransform: "uppercase",
//     bg: "red.500",
//     color: "white",
//     padding: "1rem",
//     letterSpacing: "-0.15rem",
//   };

//   const menuItems: MenuType[] = [
//     {
//       name: "Search",
//       submenu: [
//         {
//           name: "Comic Vine",
//           submenu: [
//             { name: "Issues", href: "/search/comic-vine/issues" },
//             { name: "Characters", href: "/search/comic-vine/characters" },
//             { name: "Publishers", href: "/search/comic-vine/publishers" },
//           ],
//         },
//         {
//           name: "Characters",
//           submenu: [
//             { name: "Superheros API", href: "/search/superheros/superhero-api" },
//             { name: "Superheros List", href: "/search/superheros/superheros-list" },
//           ],
//         },
//         {
//           name: "getcomics.org",
//           submenu: [{ name: "Get Some!", href: "/search/comicbooks-api" }],
//         },
//         {
//           name: "MARVEL",
//           submenu: [
//             { name: "Comics", href: "/search/marvel/marvel-comics" },
//             { name: "Characters", href: "/search/marvel/marvel-characters" },
//             { name: "Creators", href: "/search/marvel/marvel-creators" },
//             { name: "Events", href: "/search/marvel/marvel-events" },
//             { name: "Series", href: "/search/marvel/marvel-series" },
//             { name: "Stories", href: "/search/marvel/marvel-stories" },
//           ],
//         },
//       ],
//     },
//     {
//       name: "Store",
//       submenu: [
//         { name: "Buy", href: "/store/buy" },
//         { name: "Sell", href: "/store/sell" },
//       ],
//     },
//   ];

//   const renderMenuItem = (item: MenuType | SubmenuType, index: number | string) => (
//     <Menu key={index}>
//       <MenuButton as={Button} {...(item.name === "MARVEL" ? marvelButtonStyle : buttonStyle)}>
//         {item.name}
//       </MenuButton>
//       <MenuList {...customMenuListStyle}>
//         {item.submenu?.map((subItem, subIndex) =>
//           subItem.submenu ? (
//             // For items with further nested submenus (recursive call for deeper levels)
//             renderMenuItem(subItem, `${index}-${subIndex}`)
//           ) : (
//             <MenuItem as={Link} key={subIndex} href={subItem.href} {...buttonStyle}>
//               {subItem.name}
//             </MenuItem>
//           )
//         )}
//       </MenuList>
//     </Menu>
//   );

//   console.log("user", user);
//   console.log("colorMode", colorMode);
//   console.log("avatarUrl", avatarUrl);

//   return (
//     <Box as="nav" position="fixed" top="0" width={"100%"} zIndex={10}>
//       <Flex justify="space-between" wrap="wrap" padding="1.5rem" bg="gray.800" color="white">
//         <Flex align="center" mr={5}>
//           <Link href="/">
//             <RetroPopLogo />
//           </Link>
//         </Flex>

//         <Flex align="center">
//           {/* Theme Toggle Button */}
//           <IconButton
//             aria-label="Toggle theme"
//             icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
//             onClick={toggleColorMode}
//             mr={4}
//           />

//           {/* Hamburger Icon */}
//           <IconButton
//             onClick={onToggle}
//             aria-label={isOpen ? "Close menu" : "Open menu"}
//             icon={isOpen ? <CloseIcon boxSize={5} /> : <HamburgerIcon boxSize={10} />}
//             display={{ base: "block" }}
//             zIndex="tooltip"
//             mr={4}
//           />

//           {user && (
//             <Flex align="center" ml={4}>
//               <Menu>
//                 <MenuButton as={Button} p={1} borderRadius="full">
//                   <AvatarNav uid={user.id} size={50} />
//                 </MenuButton>
//                 <MenuList>
//                   <MenuItem as={Link} href="/account">
//                     Profile
//                   </MenuItem>
//                   <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
//                 </MenuList>
//               </Menu>
//             </Flex>
//           )}
//         </Flex>

//         {/* Motion div for the Hamburger Menu */}
//         <motion.div
//           variants={variants}
//           initial="closed"
//           animate={isOpen ? "open" : "closed"}
//           transition={{ duration: 0.2 }}
//           style={{
//             display: isOpen ? "block" : "none",
//             position: "fixed",
//             top: 0,
//             left: 0,
//             zIndex: 1000,
//             width: "100%",
//             height: "100%",
//             backgroundColor: "black",
//           }}
//         >
//           <Stack spacing={4} align="center" justify="center" pt="5rem">
//             {menuItems.map((item, index) => (item.submenu ? renderMenuItem(item, index) : null))}
//             {!user && (
//               <>
//                 <Button as={Link} href="/login" {...buttonStyle}>
//                   Login
//                 </Button>
//                 <Button as={Link} href="/signup" {...buttonStyle}>
//                   Sign Up
//                 </Button>
//               </>
//             )}
//           </Stack>
//         </motion.div>
//       </Flex>
//     </Box>
//   );
// };

// export default Navbar;
