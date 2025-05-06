// This file provides basic type declarations for react-quill-new

// pnpm install -D quill quill-delta
import * as React from 'react';
import {
    QuillOptionsStatic,
    RangeStatic,
    Sources,
    Delta,
    BoundsStatic,
} from 'quill';

// Define a basic type for the ReactQuill component props
export interface ReactQuillProps {
    bounds?: string | HTMLElement;
    children?: React.ReactNode;
    className?: string;
    defaultValue?: string | Delta;
    formats?: string[];
    id?: string;
    modules?: QuillOptionsStatic['modules'];
    onChange?: (value: string, delta: Delta, source: Sources, editor: any) => void; // editor: any for simplicity
    onChangeSelection?: (range: RangeStatic | null, source: Sources, editor: any) => void;
    onFocus?: (range: RangeStatic, source: Sources, editor: any) => void;
    onBlur?: (previousRange: RangeStatic, source: Sources, editor: any) => void;
    onKeyPress?: React.KeyboardEventHandler;
    onKeyDown?: React.KeyboardEventHandler;
    onKeyUp?: React.KeyboardEventHandler;
    placeholder?: string;
    readOnly?: boolean;
    style?: React.CSSProperties;
    tabIndex?: number;
    theme?: string;
    value?: string | Delta;

    // The getEditor method added by react-quill-new
    getEditor?: () => any; // Returns the Quill instance (any for simplicity)

    // Prop used by the wrapper component for ref forwarding
    forwardedRef?: React.Ref<any>; // Accept a ref of any type for simplicity
}

// Declare the ReactQuill component
declare class ReactQuill extends React.Component<ReactQuillProps> {
    // You might add more methods/properties here if needed
    focus(): void;
    blur(): void;
    getEditor(): any; // Explicitly add this method
    getBounds(index: number, length?: number): BoundsStatic | null;
    getModule(name: string): any; // Access Quill modules
    // Add other methods you might use like getContents, getText, etc.
}

// Declare the Quill import if you need to use Quill.import directly
export const Quill: any; // Export Quill itself

export default ReactQuill;
