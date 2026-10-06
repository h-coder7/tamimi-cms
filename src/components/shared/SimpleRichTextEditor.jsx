"use client";

import { useRef, useEffect } from "react";

const TOOLS = [
    { cmd: "bold", label: "B", title: "Bold" },
    { cmd: "italic", label: "I", title: "Italic" },
    { cmd: "formatBlock", value: "h2", label: "H2", title: "Heading 2" },
    { cmd: "formatBlock", value: "h3", label: "H3", title: "Heading 3" },
    { cmd: "insertUnorderedList", label: "• List", title: "Bullet list" },
    { cmd: "insertOrderedList", label: "1. List", title: "Numbered list" },
    { cmd: "createLink", label: "Link", title: "Link" },
    { cmd: "insertImage", label: "Image", title: "Image" },
    { cmd: "formatBlock", value: "blockquote", label: "Quote", title: "Quote" },
];

export default function SimpleRichTextEditor({
    value = "",
    onChange,
    placeholder = "Write the article…",
    required = false,
}) {
    const editorRef = useRef(null);
    const lastExternalValue = useRef(value);

    useEffect(() => {
        if (!editorRef.current) return;
        if (value !== lastExternalValue.current) {
            editorRef.current.innerHTML = value || "";
            lastExternalValue.current = value;
        }
    }, [value]);

    const emitChange = () => {
        if (!editorRef.current) return;
        const html = editorRef.current.innerHTML;
        lastExternalValue.current = html;
        onChange?.(html);
    };

    const runCommand = (tool) => {
        editorRef.current?.focus();

        if (tool.cmd === "createLink") {
            const url = window.prompt("Enter URL");
            if (!url) return;
            document.execCommand("createLink", false, url);
        } else if (tool.cmd === "insertImage") {
            const url = window.prompt("Enter image URL");
            if (!url) return;
            document.execCommand("insertImage", false, url);
        } else if (tool.cmd === "formatBlock") {
            document.execCommand("formatBlock", false, tool.value);
        } else {
            document.execCommand(tool.cmd, false, tool.value || null);
        }

        emitChange();
    };

    return (
        <div className="simple-rich-text border rounded-3 overflow-hidden">
            <div className="d-flex flex-wrap gap-1 p-2 border-bottom bg-light">
                {TOOLS.map((tool) => (
                    <button
                        key={`${tool.cmd}-${tool.value || tool.label}`}
                        type="button"
                        className="btn btn-sm btn-white border fsz-12 px-2"
                        title={tool.title}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => runCommand(tool)}
                    >
                        {tool.label}
                    </button>
                ))}
            </div>
            <div
                ref={editorRef}
                className="simple-rich-text__editor p-3"
                contentEditable
                suppressContentEditableWarning
                data-placeholder={placeholder}
                onInput={emitChange}
                onBlur={emitChange}
            />
            {required && (
                <input
                    tabIndex={-1}
                    aria-hidden="true"
                    className="position-absolute opacity-0"
                    style={{ height: 1, width: 1, left: 0, bottom: 0 }}
                    value={value?.replace(/<[^>]*>/g, "").trim() ? "ok" : ""}
                    onChange={() => {}}
                    required
                />
            )}
        </div>
    );
}
