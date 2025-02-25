"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useColorMode } from "@chakra-ui/react";
import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill so it only loads on the client.
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// Import your custom toolbar component
import { QuillToolbar } from "./EditorToolbar";

import Quill from "quill";
import QuillResizeImage from "quill-resize-image";

// Register additional modules (only on the client)
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

// Define the full toolbar modules configuration that uses the custom toolbar container.
const defaultModules = {
  toolbar: {
    container: "#toolbar", // this refers to the id inside QuillToolbar
    handlers: {
      // Custom undo/redo handlers (these should match those in your EditorToolbar)
      undo: function () {
        this.quill.history.undo();
      },
      redo: function () {
        this.quill.history.redo();
      },
    },
  },
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true,
  },
  // Include any additional modules like image resizing
  resize: { locale: {} },
};

// Define the formats you want to support – these should match those in your custom toolbar.
const defaultFormats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "align",
  "script",
  "list",
  "blockquote",
  "background",
  "list",
  "indent",
  "link",
  "image",
  "color",
  "code-block",
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
  const toolbarBg = colorMode === "dark" ? "#fff" : "#fff";

  return (
    <div className="rich-text-editor">
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

      {/* Render the custom toolbar */}
      <QuillToolbar />

      {/* Render the ReactQuill editor */}
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
    </div>
  );
};

export default RichTextEditor;
