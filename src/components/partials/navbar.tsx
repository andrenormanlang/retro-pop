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
		fontFamily: "Bangers", // Existing style
		fontSize: "1.2rem", // Existing style
		color: "white", // Existing style
		letterSpacing: "0.2em", // Existing style
		justifyContent: "center", // Center horizontally
		alignItems: "center", // Center vertically
		display: "flex", // Ensure the button uses flexbox
		height: "40px", // Optional: you might need to adjust the height
	};

	const customMenuListStyle = {
		bg: "gray.700", // Background color
		borderColor: "gray.600", // Border color
		borderWidth: "1px", // Border width
		borderRadius: "md", // Border radius
		boxShadow: "lg", // Box shadow
		minWidth: "200px", // Minimum width
		// Add other styles as needed
	};

	// Custom styles for MenuItem
	const customMenuItemStyle = {
		fontSize: "10px", // Font size
		_hover: {
			bg: "blue.500", // Background color on hover
			color: "white", // Text color on hover
		},
		_focus: {
			bg: "blue.600", // Background color when focused
		},
		// Add other styles as needed
	};

	const menuItems = [

		{
			name: "Search",
			submenu: [
				{ name: "Issues", href: "/search/issues" },
				{ name: "Characters", href: "/search/characters" },
			],
		},
		{ name: "Share / Buy", href: "/shared-comics" },
		{ name: "Forums", href: "/forums" },
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
						display={{ base: "block", md: "" }} // Shown only in mobile view
						_hover={{ bg: "transparent" }}
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
};

export default Navbar;
