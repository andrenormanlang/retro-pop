// components/RichTextEditor.tsx
"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useColorMode } from "@chakra-ui/react";

// Import modules and formats constants from EditorToolbar
import { modules, formats } from "./EditorToolbar"; // This now includes the resize module config

// Dynamically import react-quill-new
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import("react-quill-new");
        const QuillWrapper = ({ forwardedRef, ...props }: any) => (
            <RQ ref={forwardedRef} {...props} />
        );
        QuillWrapper.displayName = "QuillWrapper";
        return QuillWrapper;
    },
    {
        ssr: false,
    }
);

// Define component props interface
export interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    style?: React.CSSProperties;
    className?: string;
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
    className,
    minHeight = "200px",
    maxHeight = "600px",
    autoFocus = false,
    onFocus,
    onBlur,
}) => {
    const { colorMode } = useColorMode();
    const editorRef = React.useRef<any>(null);

    React.useEffect(() => {
        if (autoFocus && editorRef.current) {
            const quillEditor = editorRef.current.getEditor();
            if (quillEditor) {
                const timer = setTimeout(() => {
                     quillEditor.focus();
                }, 0);
                return () => clearTimeout(timer);
            }
        }
        return () => {};
    }, [autoFocus, editorRef.current]);


    const editorBg = colorMode === "dark" ? "#2D3748" : "#FFFFFF";
    const editorTextColor = colorMode === "dark" ? "#CBD5E0" : "#2D3748";
    const borderColor = colorMode === "dark" ? "#4A5568" : "#E2E8F0";

    return (
        <div className={`rich-text-editor ${className || ""}`}>
            <style jsx global>{`
                /* Ensure base quill.snow.css is loaded globally in layout.tsx */

                /* Target the main Quill containers within the outer div */
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                    border-color: ${borderColor} !important;
                    background-color: ${editorBg} !important;
                    padding: 8px 15px !important;
                    line-height: normal !important;
                }

                .rich-text-editor .ql-container {
                    border-bottom-left-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                    border-color: ${borderColor} !important;
                    background-color: ${editorBg} !important;
                    min-height: ${minHeight} !important;
                    max-height: ${maxHeight} !important;
                    overflow-y: auto !important;
                    border-top: none !important;
                    padding: 0 !important;
                }

                /* Target the editable area */
                .rich-text-editor .ql-editor {
                    color: ${editorTextColor} !important;
                    min-height: ${minHeight} !important;
                    height: auto !important;
                    max-height: ${maxHeight} !important;
                    background-color: inherit !important;
                    padding: 15px !important;
                    line-height: 1.5 !important;
                    word-wrap: break-word;
                }

                /* Placeholder styles */
                .ql-editor.ql-blank::before {
                    color: ${colorMode === "dark" ? "#718096" : "#A0AEC0"} !important;
                    left: 15px !important;
                    font-style: normal !important;
                    content: attr(data-placeholder) !important;
                    pointer-events: none !important;
                    right: unset !important;
                }

                /* Toolbar element styling (buttons, selects, pickers) */
                .ql-snow .ql-stroke { stroke: ${editorTextColor} !important; }
                .ql-snow .ql-fill { fill: ${editorTextColor} !important; }
                .ql-picker-label { color: ${editorTextColor} !important; }

                /* Picker dropdown options styling */
                .ql-snow .ql-picker-options {
                    background-color: ${editorBg} !important;
                    border-color: ${borderColor} !important;
                    z-index: 10 !important;
                }
                .ql-snow .ql-picker-options .ql-picker-item {
                     color: ${editorTextColor} !important;
                }
                 /* Hover state for picker options */
                 .ql-snow .ql-picker-options .ql-picker-item:hover {
                      background-color: ${colorMode === 'dark' ? '#4A5568' : '#E2E8F0'} !important;
                 }

                /* Border for picker labels */
                .ql-snow .ql-picker-label { border-color: ${colorMode === "dark" ? "#4A5568" : "#E2E8F0"} !important; }
                .ql-snow .ql-picker.ql-expanded .ql-picker-label { border-color: ${colorMode === "dark" ? "#4A5568" : "#E2E8F0"} !important; }
                 .ql-snow .ql-picker.ql-expanded .ql-picker-options { border-color: ${colorMode === "dark" ? "#4A5568" : "#E2E8F0"} !important; }

                /* Hover/Focus/Active states for toolbar buttons and pickers */
                 .ql-snow .ql-formats button:hover,
                 .ql-snow .ql-formats button:focus,
                 .ql-snow .ql-formats button.ql-active,
                 .ql-snow .ql-picker-label:hover,
                 .ql-snow .ql-picker-label.ql-active {
                      color: ${colorMode === 'dark' ? '#90CDF4' : '#2B6CB0'} !important;
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
                .ql-editor .ql-font-libre-franklin { font-family: "Libre Franklin", sans-serif; }
                .ql-editor .ql-font-inter { font-family: "Inter", sans-serif; }

                /* --- Custom Size Styles (match values in Size.whitelist) --- */
                .ql-editor .ql-size-8px { font-size: 8px; }
                .ql-editor .ql-size-10px { font-size: 10px; }
                .ql-editor .ql-size-12px { font-size: 12px; }
                .ql-editor .ql-size-14px { font-size: 14px; }
                .ql-editor .ql-size-16px { font-size: 16px; }
                .ql-editor .ql-size-20px { font-size: 20px; }
                .ql-editor .ql-size-24px { font-size: 24px; }
                .ql-editor .ql-size-32px { font-size: 32px; }
                .ql-editor .ql-size-48px { font-size: 48px; }

                /* --- Other standard Quill styles you might want to override --- */
                .ql-editor blockquote {
                    border-left: 4px solid ${borderColor} !important;
                    margin-bottom: 5px !important; margin-top: 5px !important;
                    padding-left: 16px !important;
                }
                 .ql-editor .ql-code-block {
                    background-color: ${colorMode === 'dark' ? '#1A202C' : '#F7FAFC'} !important;
                    border-radius: 4px !important;
                    margin-bottom: 5px !important; margin-top: 5px !important;
                    padding: 8px 16px !important;
                     font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace !important;
                     white-space: pre-wrap !important;
                 }
                 .ql-editor a {
                    color: ${colorMode === 'dark' ? '#90CDF4' : '#3182CE'} !important;
                    text-decoration: underline !important;
                 }
                 .ql-editor ul, .ql-editor ol { padding-left: 1.5em !important; }
                  .ql-editor li { margin-bottom: 4px !important; }

                 /* --- Styles needed for quill-resize-image handles --- */
                 /* These styles are often required by resize modules */
                 .ql-editor .ql-ui { /* Container for resize handles/ui */
                    position: absolute !important;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 100; /* Ensure resize handles are above content */
                 }
                 .ql-editor .ql-ui .ql-handle { /* Resize handles */
                    position: absolute !important;
                    width: 12px !important;
                    height: 12px !important;
                    background-color: ${colorMode === 'dark' ? '#90CDF4' : '#3182CE'} !important; /* Handle color */
                    border: 1px solid ${editorBg} !important; /* Border for contrast */
                    z-index: 101 !important; /* Ensure handles are above the container */
                 }
                 /* Position the handles */
                 .ql-editor .ql-ui .ql-handle-tl { top: -6px; left: -6px; cursor: nwse-resize; }
                 .ql-editor .ql-ui .ql-handle-tr { top: -6px; right: -6px; cursor: nesw-resize; }
                 .ql-editor .ql-ui .ql-handle-bl { bottom: -6px; left: -6px; cursor: nesw-resize; }
                 .ql-editor .ql-ui .ql-handle-br { bottom: -6px; right: -6px; cursor: nwse-resize; }
                 /* Optional: Style for the selector border */
                 .ql-editor .ql-ui .ql-selection {
                    border: 1px dashed ${colorMode === 'dark' ? '#90CDF4' : '#3182CE'} !important; /* Border around selected image */
                    box-sizing: border-box;
                 }


            `}</style>

            {/*
              The dynamically imported ReactQuill component.
              It will now have the resize module enabled via the 'modules' prop.
            */}
            <ReactQuill
                forwardedRef={editorRef}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                readOnly={readOnly}
                modules={modules} // Pass the modules object including resize config
                formats={formats}
                theme="snow"
                style={style}
                className={className}
                onFocus={onFocus}
                onBlur={onBlur}
            />
        </div>
    );
};

export default RichTextEditor;
