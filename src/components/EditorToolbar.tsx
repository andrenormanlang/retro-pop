// components/EditorToolbar.tsx
"use client"; // This file also needs to be a client component

import { Quill } from "react-quill-new"; // Import Quill from the fork
// !!! IMPORT THE IMAGE RESIZE MODULE !!!
import QuillResizeImage from 'quill-resize-image';


// Add proper types for Quill formats/attributors (or use any if types are missing)
interface QuillAttributor {
    whitelist: string[];
}

// --- Register Custom Fonts ---
// Get the Font class from Quill
const Font = Quill.import("formats/font") as QuillAttributor;
// Add your custom font names to the whitelist
Font.whitelist = [
    "arial",
    "comic-sans",
    "courier-new",
    "georgia",
    "helvetica",
    "lucida",
    "times-new-roman",
    "libre-franklin", // Add your custom font here
    "inter" // Add your other custom font here
];
// Register the custom Font format with Quill
Quill.register("formats/font", Font, true);

// --- Register Custom Sizes ---
// Get the Size Attributor from Quill
const Size = Quill.import("attributors/style/size") as QuillAttributor;
// Add your custom size values (using px is common for size attributor)
Size.whitelist = ["8px", "10px", "12px", "14px", "16px", "20px", "24px", "32px", "48px"];
// Register the custom Size attributor
Quill.register("attributors/style/size", Size, true);


// !!! REGISTER THE IMAGE RESIZE MODULE WITH QUILL !!!
// Use the imported module directly (not window.QuillResizeImage)
Quill.register("modules/resize", QuillResizeImage);


// --- Define Modules ---
// This object configures the editor's behavior and features, including the toolbar
export const modules = {
    // The toolbar array defines the buttons and controls in the UI
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }], // Headers and normal text
        [{ font: Font.whitelist }], // Font dropdown using the registered whitelist
        [{ size: Size.whitelist }], // Size dropdown using the registered whitelist (px values)
        ["bold", "italic", "underline", "strike"], // Basic formats
        [{ color: [] }, { background: [] }], // Color and background pickers
        [{ script: "sub" }, { script: "super" }], // Subscript/Superscript
        ["blockquote", "code-block"], // Blockquote and code block
        [{ list: "ordered" }, { list: "bullet" }], // Ordered and unordered lists
        [{ indent: "-1" }, { indent: "+1" }], // Indent/Outdent
        [{ align: [] }], // Text alignment
        ["link", "image"], // Keep the image button in the toolbar
        // Add "video" here if you enable the video module
        ["clean"], // Button to remove formatting
    ],
    history: {
        delay: 500,
        maxStack: 100,
        userOnly: true,
    },
    // !!! ADD THE RESIZE MODULE TO THE MODULES CONFIGURATION !!!
    // This tells Quill to enable the registered 'resize' module
    resize: {
      // Optional: locale configuration for translations if needed
      // locale: { center: 'Center', ... }
    },
    // Add other modules here as needed, e.g., syntax: true
};

// --- Define Formats ---
// This array lists all formats that Quill should recognize and preserve
// 'image' should already be here if you have the image button in the toolbar
export const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "script",
    "color",
    "background",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image", // Keep 'image' in formats
    // Add "video" if using the video module
    "clean",
];

// No default export needed for this file if only exporting constants
