"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useColorMode } from "@chakra-ui/react";
import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill so it only loads on the client.
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// Import Quill from "quill" and register additional modules.
import Quill from "quill";
import QuillResizeImage from "quill-resize-image";

// Ensure this runs only on the client.
if (typeof window !== "undefined" && Quill) {
  try {
    Quill.register("modules/resize", QuillResizeImage);
  } catch (error) {
    console.error("Error registering QuillResizeImage:", error);
  }
}

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
  className?: string;
  modules?: any;
  formats?: string[];
}

const defaultModules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image"],
    // We remove color/background controls so inline colors don’t conflict with theme.
    ["clean"],
  ],
  // Enable image resizing via the registered module.
  resize: { locale: {} },
};

const defaultFormats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "indent",
  "link",
  "image",
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter text...",
  readOnly = false,
  style,
  className,
  modules = defaultModules,
  formats = defaultFormats,
}) => {
  const { colorMode } = useColorMode();

  // Choose theme-based colors.
  const editorBg = colorMode === "dark" ? "#1A202C" : "#fff";
  const editorTextColor = colorMode === "dark" ? "#fff" : "#000";
  const toolbarBg = colorMode === "dark" ? "#2D3748" : "#fff";

  return (
    <>
      {/* Global style overrides for ReactQuill */}
      <style jsx global>{`
        /* Sticky toolbar */
        .ql-toolbar.ql-snow {
          position: sticky;
          top: 0;
          z-index: 10;
          background: ${toolbarBg};
        }
        /* Editor container inherits theme colors */
        .ql-container.ql-snow {
          background-color: ${editorBg};
          color: ${editorTextColor};
        }
        /* Ensure editor content always inherits the container’s color */
        .ql-editor {
          min-height: 200px;
          background-color: inherit !important;
          color: inherit !important;
        }
        .ql-editor * {
          background-color: transparent !important;
          color: inherit !important;
        }
        .ql-editor.ql-blank::before {
          color: ${colorMode === "dark" ? "#CBD5E0" : "#A0AEC0"};
        }
      `}</style>

      <ReactQuill
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
        theme="snow"
        style={style}
        className={className}
      />
    </>
  );
};

export default RichTextEditor;
