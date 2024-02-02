"use client";

import React from "react";
import {
	Box,
	Flex,
	Button,
	IconButton,
	Link,
	useDisclosure,
	useColorMode,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Stack,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import RetroPopLogo from "./logo"; // Changed this line
import { MenuType, SubmenuType } from "@/types/navbar/nav.types";

const Navbar = () => {
	const { isOpen, onToggle } = useDisclosure();
	const { colorMode, toggleColorMode } = useColorMode();

	const variants = {
		open: { opacity: 1, x: 0 },
		closed: { opacity: 0, x: "-100%" },
	};

	const buttonStyle = {
		width: "200px", // Existing style
		fontWeight: "700", // Existing style
		fontFamily: "Bangers", // Existing style
		fontSize: "1.3rem", // Existing style
		letterSpacing: "0.2rem", // Existing style
		color: "white", // Existing style

		justifyContent: "center", // Center horizontally
		alignItems: "center", // Center vertically
		display: "flex", // Ensure the button uses flexbox
		height: "2rem",
		my: "0.5rem", // Add vertical margin to each menu item
		// w: "full",
		bg: "blue.500", // A more standard blue
		borderRadius: "md", // Rounded corners
		outline: "none", // Remove default outline
		_hover: {
			bg: "blue.500", // Change the background color on hover
			color: "white", // Change the text color on hover
		},
		_active: {
			bg: "blue.700", // Change the background color when active/pressed
			color: "white", // Text color when active/pressed
		},
		_focus: {
			bg: "blue.600", // Background color when focused
			boxShadow: "outline", // Outline when focused
		},
	};

	const customMenuListStyle = {
		borderColor: "gray.600", // Border color
		borderWidth: "1px", // Border width
		borderRadius: "md", // Border radius
		boxShadow: "lg", // Box shadow
		minWidth: "200px", // Minimum width
		// Add other styles as needed
		fontSize: "10px", // Font size
		color: "gray.800", // Darker text for readability
		outline: "none", // Remove default outline
		margin: "1",
		_hover: {
			bg: "blue.600", // Consistent with button hover style
		},
		_focus: {
			bg: "blue.700", // Slightly darker on focus
			outline: "none", // Remove default outline
		},
	};

	// const customMenuListStyle = {
	//     // ... [existing styles]
	//     color: "gray.800", // Darker text for readability
	//     _hover: {
	//         bg: "blue.600", // Consistent with button hover style
	//     },
	//     _focus: {
	//         bg: "blue.700", // Slightly darker on focus
	//         outline: "none", // Remove default outline
	//     },
	// };

	// const searchButtonStyle = {
	// 	...buttonStyle, // Include existing button styles
	// 	_hover: {
	// 	  bg: colorMode === 'light' ? '#0069d9' : 'desiredDarkModeHoverColor', // Change 'desiredDarkModeHoverColor' to your preferred color for dark mode
	// 	  color: '#ffffff',
	// 	},
	//   };

	const menuItems: MenuType[]= [
		{
			name: "Search",
			submenu: [
				{ name: "Comic Vine", href: "/search/comic-vine" },
				{ name: "Characters", href: "/search/superhero-api" },
				{
					name: "Marvel",
					submenu: [
						{
							name: "Comics",
							href: "/search/marvel/marvel-comics",
						},
						// {name: "Characters",href: "/search/marvel/marvel-characters"},
						// {name: "Stories",href: "/search/marvel/marvel-stories"},
						// {name: "Series",href: "/search/marvel/marvel-series"},
						// {name: "Events",href: "/search/marvel/marvel-events"},
						// {name: "Creators",href: "/search/marvel/marvel-creators"},
					],
				},
			],
		},
	];

	const renderMenuItem =(item: MenuType | SubmenuType, index: number | string) => (
		<Menu key={index}>
			<MenuButton as={Button} {...buttonStyle}>
				{item.name}
			</MenuButton>
			<MenuList {...customMenuListStyle}>
				{item.submenu?.map((subItem, subIndex) =>
					subItem.submenu ? (
						// For items with further nested submenus (recursive call for deeper levels)
						renderMenuItem(subItem, `${index}-${subIndex}`)
					) : (
						<MenuItem
							as={Link}
							key={subIndex}
							href={subItem.href}
							{...buttonStyle}
						>
							{subItem.name}
						</MenuItem>
					)
				)}
			</MenuList>
		</Menu>
	);

	return (
		<Box as="nav" position="fixed" top="0" width={"100%"} zIndex={10}>
			<Flex
				justify="space-between"
				wrap="wrap"
				padding="1.5rem"
				bg="gray.800"
				color="white"
			>
				<Flex align="center" mr={5}>
					<Link href="/">
						<RetroPopLogo />
					</Link>
				</Flex>

				<Flex align="center">
					{/* Hamburger Icon */}
					<IconButton
						onClick={onToggle}
						aria-label={isOpen ? "Close menu" : "Open menu"}
						icon={
							isOpen ? (
								<CloseIcon boxSize={5} />
							) : (
								<HamburgerIcon boxSize={10} />
							)
						}
						display={{ base: "block", md: "" }}
						zIndex="tooltip"
						mr={4}
					></IconButton>

					{/* Theme Toggle Button */}
					<Button
						onClick={toggleColorMode}
						leftIcon={
							colorMode === "dark" ? (
								<SunIcon boxSize={4} />
							) : (
								<MoonIcon boxSize={4} />
							)
						}
						display={{ base: "block", md: "block" }}
						_hover={{
							bg: colorMode === "light" ? "gray.200" : "gray.600",
							color: colorMode === "light" ? "gray.800" : "white",
						}}
					>
						{/* Show only the sun and moon icons */}
						{colorMode === "dark" ? "Sun" : "Moon"}
					</Button>
				</Flex>

				<Box
					display={{ base: isOpen ? "block" : "none", md: "none" }}
					position="fixed"
					top="0"
					bottom="0"
					left="0"
					right="0"
					bg="blackAlpha.600"
				/>

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
					<Stack
						spacing={4}
						align="center"
						alignContent="center"
						justify="center"
						minHeight="100vh"
						pt="5rem"
					>
						<Stack
							spacing={4}
							align="center"
							justify="center"
							minHeight="100vh"
							pt="5rem"
						>
							{menuItems.map((item, index) =>
								item.submenu
									? renderMenuItem(item, index)
									: null
							)}
						</Stack>
					</Stack>
				</motion.div>
			</Flex>
		</Box>
	);
};

export default Navbar;
