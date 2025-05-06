// components/RichTextEditor.tsx
"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useColorMode } from "@chakra-ui/react"; // Import useColorMode from Chakra UI

// REMOVE the CSS import here, it's now in layout.tsx
// import "react-quill-new/dist/quill.snow.css";

// Import modules and formats constants from EditorToolbar
import { modules, formats } from "./EditorToolbar";

// Dynamically import react-quill-new, disabling SSR
// This is crucial for Next.js 15 (React 18+) to avoid findDOMNode error
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import("react-quill-new");
        // Wrapper component to correctly forward the ref to the underlying ReactQuill
        const QuillWrapper = ({ forwardedRef, ...props }: any) => (
            <RQ ref={forwardedRef} {...props} />
        );
        QuillWrapper.displayName = "QuillWrapper"; // Helpful for debugging
        return QuillWrapper;
    },
    {
        ssr: false, // Prevent server-side rendering
        // Optional: Add a loading state while the editor chunk loads
        // loading: () => <p>Loading editor...</p>
    }
);

// Define component props interface
export interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    style?: React.CSSProperties;
    className?: string; // Outer class name for the container div
    /** Minimum height of the editor */
    minHeight?: string;
    /** Maximum height of the editor */
    maxHeight?: string;
    /** Auto focus the editor on mount */
    autoFocus?: boolean;
    /** Callback when editor is focused */
    onFocus?: () => void;
    /** Callback when editor loses focus */
    onBlur?: () => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = "Enter text...",
    readOnly = false,
    style,
    className, // Class name for the outer div
    minHeight = "200px",
    maxHeight = "600px",
    autoFocus = false,
    onFocus,
    onBlur,
}) => {
    const { colorMode } = useColorMode(); // Get current color mode from Chakra UI
    // Ref to hold the instance of the ReactQuill component
    const editorRef = React.useRef<any>(null); // Use 'any' if react-quill-new types are missing

    // Effect to handle autoFocus when the component mounts and Quill is ready
    React.useEffect(() => {
        if (autoFocus && editorRef.current) {
            // Access the underlying Quill editor instance via getEditor()
            const quillEditor = editorRef.current.getEditor();
            // Ensure the Quill editor instance is available before trying to focus
            if (quillEditor) {
                // Use a small timeout to ensure Quill's internal state is ready
                // Sometimes needed with dynamic imports and rapid mounting
                const timer = setTimeout(() => {
                     quillEditor.focus();
                }, 0); // 0ms delay defers execution to the next event loop tick

                // Cleanup the timer if the component unmounts before the timeout
                return () => clearTimeout(timer);
            }
        }
        // Provide a cleanup function even if autoFocus is false or ref isn't set initially
        return () => {};
    }, [autoFocus, editorRef.current]); // Dependencies: re-run if autoFocus or the ref object changes


    // Define colors based on the current color mode
    const editorBg = colorMode === "dark" ? "#2D3748" : "#FFFFFF"; // Chakra UI gray.800 / white
    const editorTextColor = colorMode === "dark" ? "#CBD5E0" : "#2D3748"; // Chakra UI gray.400 / gray.800
    const borderColor = colorMode === "dark" ? "#4A5568" : "#E2E8F0"; // Chakra UI gray.600 / gray.200

    return (
        // Outer container div. Apply custom className and the base class for styling scope.
        <div className={`rich-text-editor ${className || ""}`}>
            {/*
              Global styles using style jsx global. These styles override the base
              quill.snow.css and apply dynamic styles based on color mode.
              Since quill.snow.css is loaded globally, and ReactQuill renders
              the standard Quill DOM structure, these selectors should now work
              correctly to apply your theme and sizing/font overrides.
            */}
            <style jsx global>{`
                /* Target the main Quill containers within the outer div */
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                    border-color: ${borderColor} !important; /* Override default border color */
                    background-color: ${editorBg} !important; /* Apply background color */
                    padding: 8px 15px !important; /* Adjust padding */
                    line-height: normal !important; /* Ensure normal line height for toolbar */
                    /* Add other toolbar specific styles here */
                }

                .rich-text-editor .ql-container {
                    border-bottom-left-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                    border-color: ${borderColor} !important; /* Override default border color */
                    background-color: ${editorBg} !important; /* Apply background color */
                    min-height: ${minHeight} !important; /* Apply min height from props */
                    max-height: ${maxHeight} !important; /* Apply max height from props */
                    overflow-y: auto !important; /* Enable vertical scrolling */
                    border-top: none !important; /* Prevent double border between toolbar and container */
                    padding: 0 !important; /* Remove default container padding */
                }

                /* Target the editable area */
                .rich-text-editor .ql-editor {
                    color: ${editorTextColor} !important; /* Apply text color */
                    min-height: ${minHeight} !important; /* Apply min height */
                    height: auto !important; /* Allow height to adjust */
                    max-height: ${maxHeight} !important; /* Apply max height */
                    background-color: inherit !important; /* Ensure background color comes from container */
                    padding: 15px !important; /* Add padding inside the editor */
                    line-height: 1.5 !important; /* Default line height for content */
                    word-wrap: break-word; /* Prevent overflow */
                }

                /* Placeholder styles */
                .ql-editor.ql-blank::before {
                    color: ${colorMode === "dark" ? "#718096" : "#A0AEC0"} !important; /* Placeholder color */
                    left: 15px !important; /* Align placeholder with editor padding */
                    font-style: normal !important; /* Ensure placeholder isn't italic */
                    content: attr(data-placeholder) !important; /* Use the placeholder text */
                    pointer-events: none !important; /* Allow clicks to go through */
                    right: unset !important; /* Override default right:0 */
                }

                /* Toolbar element styling (buttons, selects, pickers) */
                .ql-snow .ql-stroke {
                    stroke: ${editorTextColor} !important; /* Apply color to icons (stroke) */
                }
                 .ql-snow .ql-fill {
                    fill: ${editorTextColor} !important; /* Apply color to icons (fill) */
                }
                 .ql-picker-label {
                    color: ${editorTextColor} !important; /* Apply color to dropdown labels */
                 }

                /* Picker dropdown options styling */
                .ql-snow .ql-picker-options {
                    background-color: ${editorBg} !important; /* Background color for dropdowns */
                    border-color: ${borderColor} !important; /* Border color for dropdowns */
                    z-index: 10 !important; /* Ensure dropdowns appear above other content */
                }

                .ql-snow .ql-picker-options .ql-picker-item {
                     color: ${editorTextColor} !important; /* Text color for dropdown items */
                }

                 /* Hover state for picker options */
                 .ql-snow .ql-picker-options .ql-picker-item:hover {
                      background-color: ${colorMode === 'dark' ? '#4A5568' : '#E2E8F0'} !important; /* Background on hover */
                 }

                /* Border for picker labels */
                .ql-snow .ql-picker-label {
                    border-color: ${colorMode === "dark" ? "#4A5568" : "#E2E8F0"} !important;
                }
                .ql-snow .ql-picker.ql-expanded .ql-picker-label {
                    border-color: ${colorMode === "dark" ? "#4A5568" : "#E2E8F0"} !important; /* Border when expanded */
                }
                 .ql-snow .ql-picker.ql-expanded .ql-picker-options {
                    border-color: ${colorMode === "dark" ? "#4A5568" : "#E2E8F0"} !important; /* Border when expanded */
                 }

                /* Hover/Focus/Active states for toolbar buttons and pickers */
                 .ql-snow .ql-formats button:hover,
                 .ql-snow .ql-formats button:focus,
                 .ql-snow .ql-formats button.ql-active,
                 .ql-snow .ql-picker-label:hover,
                 .ql-snow .ql-picker-label.ql-active {
                      color: ${colorMode === 'dark' ? '#90CDF4' : '#2B6CB0'} !important; /* Example blue highlight */
                      fill: ${colorMode === 'dark' ? '#90CDF4' : '#2B6CB0'} !important;
                      stroke: ${colorMode === 'dark' ? '#90CDF4' : '#2B6CB0'} !important;
                 }


                /* --- Custom Font Styles (match values in Font.whitelist) --- */
                .ql-editor .ql-font-arial { font-family: Arial, sans-serif; }
                .ql-editor .ql-font-comic-sans { font-family: "Comic Sans MS", cursive; }
                .ql-editor .ql-font-courier-new { font-family: "Courier New", monospace; }
                .ql-editor .ql-font-georgia { font-family: Georgia, serif; }
                .ql-editor .ql-font-helvetica { font-family: Helvetica, sans-serif; }
                .ql-editor .ql-font-lucida { font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif; }
                .ql-editor .ql-font-times-new-roman { font-family: "Times New Roman", Times, serif; }
                .ql-editor .ql-font-libre-franklin { font-family: "Libre Franklin", sans-serif; } /* Style for Libre Franklin */
                .ql-editor .ql-font-inter { font-family: "Inter", sans-serif; } /* Style for Inter */

                /* --- Custom Size Styles (match values in Size.whitelist) --- */
                 /* Quill's snow theme has default styles for some px values,
                    but defining them explicitly ensures your whitelist works. */
                .ql-editor .ql-size-8px { font-size: 8px; }
                .ql-editor .ql-size-10px { font-size: 10px; }
                .ql-editor .ql-size-12px { font-size: 12px; }
                .ql-editor .ql-size-14px { font-size: 14px; }
                .ql-editor .ql-size-16px { font-size: 16px; } /* Standard size */
                .ql-editor .ql-size-20px { font-size: 20px; }
                .ql-editor .ql-size-24px { font-size: 24px; }
                .ql-editor .ql-size-32px { font-size: 32px; }
                .ql-editor .ql-size-48px { font-size: 48px; }

                /* --- Other standard Quill styles you might want to override --- */
                /* Blockquote style */
                .ql-editor blockquote {
                    border-left: 4px solid ${borderColor} !important;
                    margin-bottom: 5px !important;
                    margin-top: 5px !important;
                    padding-left: 16px !important;
                }
                 /* Code block style */
                 .ql-editor .ql-code-block {
                    background-color: ${colorMode === 'dark' ? '#1A202C' : '#F7FAFC'} !important; /* Chakra UI gray.900 / gray.50 */
                    border-radius: 4px !important;
                    margin-bottom: 5px !important;
                    margin-top: 5px !important;
                    padding: 8px 16px !important;
                     font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace !important;
                     white-space: pre-wrap !important; /* Wrap long lines */
                 }
                 /* Links */
                 .ql-editor a {
                    color: ${colorMode === 'dark' ? '#90CDF4' : '#3182CE'} !important; /* Chakra UI blue.300 / blue.600 */
                    text-decoration: underline !important;
                 }


                /* Ensure lists have proper spacing */
                 .ql-editor ul, .ql-editor ol {
                     padding-left: 1.5em !important; /* Standard list padding */
                 }
                  .ql-editor li {
                      margin-bottom: 4px !important; /* Space between list items */
                  }


            `}</style>

            {/*
              The dynamically imported ReactQuill component.
              It will render its own toolbar structure based on the 'modules' prop.
            */}
            <ReactQuill
                forwardedRef={editorRef} // Pass the ref to our wrapper
                value={value}
                onChange={onChange}
                placeholder={placeholder} // This populates the data-placeholder attribute
                readOnly={readOnly}
                modules={modules} // Pass the modules object with inline toolbar config
                formats={formats} // Pass the formats array
                theme="snow" // Ensure theme matches the imported CSS
                style={style} // Apply inline style prop if passed
                className={className} // Apply className prop to the ReactQuill component root element itself
                onFocus={onFocus}
                onBlur={onBlur}
            />
        </div>
    );
};

export default RichTextEditor;
