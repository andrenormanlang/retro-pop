// components/EditorToolbar.tsx
"use client"; // This file also needs to be a client component

import { Quill } from "react-quill-new"; // Import Quill from the fork

// Add proper types for Quill formats/attributors (or use any if types are missing)
interface QuillAttributor {
    whitelist: string[];
}

// --- Register Custom Fonts ---
// Get the Font class from Quill
const Font = Quill.import("formats/font") as QuillAttributor;
// Add your custom font names to the whitelist
// Ensure these names correspond to CSS font-family values or recognizable slugs
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
        ["link", "image"], // Link and image buttons
        // Add "video" here if you enable the video module
        ["clean"], // Button to remove formatting
    ],
    history: {
        delay: 500,
        maxStack: 100,
        userOnly: true,
    },
    // Add other modules here as needed, e.g.:
    // imageResize: { // Make sure to install and import quill-image-resize-module if using
    //     modules: ['Resize', 'DisplaySize', 'Toolbar']
    // },
    // syntax: true, // Make sure to install and import quill-syntax if using
};

// --- Define Formats ---
// This array lists all formats that Quill should recognize and preserve
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
    "image",
    // Add "video" if using the video module
    "clean",
];

