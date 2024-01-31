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

	const menuItems = [

		{
			name: "Search",
			submenu: [
				{ name: "Comic Vine", href: "/search/comic-vine" },
				{ name: "Characters", href: "/search/superhero-api" },
			],
		},
		// { name: "Share / Buy", href: "/shared-comics" },
		// { name: "Forums", href: "/forums" },
	];

	return (
		<Box as="nav" position="fixed" top="0" width={"100%"} zIndex={10}>
			<Flex
				justify="space-between"
				wrap="wrap"
				padding="1.5rem"
				bg="gray.800"
				color="white"

				// or any value that makes it on top of other elements
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
						display={{ base: "block", md: "" }} // Shown only in mobile view
						zIndex="tooltip"
						mr={4} // Added margin to separate the buttons
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
						display={{ base: "block", md: "block" }} // Shown only in mobile view
						_hover={{
							bg: colorMode === "light" ? "gray.200" : "gray.600", // Adjust the background color on hover based on the theme
							color: colorMode === "light" ? "gray.800" : "white", // Adjust the text color on hover based on the theme
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

					//   zIndex="overlay"
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
						{menuItems.map((item, index) => {
							if (item.submenu) {
								// If the item has a submenu, render a Menu with MenuItems
								return (
									<Menu key={index}>
										<MenuButton
											as={Button}
											{...buttonStyle}
										>
											{item.name}
										</MenuButton>
										<MenuList {...customMenuListStyle}>
											{item.submenu.map((subItem) => (
												<MenuItem
													as={Link}
													key={subItem.name}
													href={subItem.href}
													{...buttonStyle}
												>
													{subItem.name}
												</MenuItem>
											))}
										</MenuList>
									</Menu>
								);
							} else {
								// If the item does not have a submenu, render a Link
								return (
									<Link
										key={index}
										href={item.href}
										padding={2}
										rounded="md"
										{...buttonStyle}
										_hover={{ bg: "blue.700" }}
										onClick={onToggle}
									>
										{item.name}
									</Link>
								);
							}
						})}
						{/* Search Submenu */}
						<Menu
							gutter={4}
							autoSelect={false}
							closeOnSelect={false}
							closeOnBlur={false}
						>
							<MenuList>
								{menuItems.map((item, index) => {
									// Check if the item has a submenu
									if (item.submenu) {
										// Render a Menu with MenuItems for the submenu
										return (
											<Menu
												key={index}
												gutter={4}
												autoSelect={false}
												closeOnSelect={false}
												closeOnBlur={false}
											>
												<MenuButton
													as={Button}
													{...buttonStyle}
												>
													{item.name}
												</MenuButton>
												<MenuList>
													{item.submenu.map(
														(subItem) => (
															<MenuItem
																as={Link}
																key={
																	subItem.name
																}
																href={
																	subItem.href
																}
																{...buttonStyle}
															>
																{subItem.name}
															</MenuItem>
														)
													)}
												</MenuList>
											</Menu>
										);
									} else {
										// Render a Link for items without a submenu
										return (
											<Link
												key={index}
												alignContent={"center"}
												href={item.href}
												padding={2}
												rounded="md"
												{...buttonStyle}
												_hover={{ bg: "blue.700" }}
												onClick={onToggle}
											>
												{item.name}
											</Link>
										);
									}
								})}
							</MenuList>
						</Menu>

						{/* Register, Login, and Logout Buttons */}
						{/* <Box mt={4}>
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
						</Box> */}
					</Stack>
				</motion.div>
			</Flex>
		</Box>
	);
};

export default Navbar;
