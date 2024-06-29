import { Box, IconButton } from "@chakra-ui/react";
import { FiShoppingCart } from "react-icons/fi";

const ShoppingCartButton = () => (
  <Box>
    <IconButton
      aria-label="Cart"
      icon={<FiShoppingCart />}
      size="md"
      variant="outline"
      colorScheme="blue"
      _hover={{
        bg: "blue.500",
        color: "white",
        borderColor: "blue.500",
      }}
      _active={{
        bg: "blue.600",
        color: "white",
        borderColor: "blue.600",
      }}
      _focus={{
        boxShadow: "outline",
      }}
    />
  </Box>
);

export default ShoppingCartButton;
