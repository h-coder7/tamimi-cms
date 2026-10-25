"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { isSafeHttpUrl, sanitizeRichText } from "@/lib/sanitizeRichText";
import { useI18n } from "@/hooks/useI18n";

const TOOLS = [
    { cmd: "bold", label: "B", titleKey: "editor.bold" },
    { cmd: "italic", label: "I", titleKey: "editor.italic" },
    { cmd: "formatBlock", value: "h2", label: "H2", titleKey: "editor.h2" },
    { cmd: "formatBlock", value: "h3", label: "H3", titleKey: "editor.h3" },
    { cmd: "insertUnorderedList", labelKey: "editor.listBullet", titleKey: "editor.bullet" },
    { cmd: "insertOrderedList", labelKey: "editor.listNumbered", titleKey: "editor.numbered" },
    { cmd: "createLink", labelKey: "editor.link", titleKey: "editor.link" },
    { cmd: "formatBlock", value: "blockquote", labelKey: "editor.quote", titleKey: "editor.quote" },
];

const SimpleRichTextEditor = forwardRef(function SimpleRichTextEditor(
    {
        value = "",
        onChange,
        placeholder,
        required = false,
    },
    ref
) {
    const { t, isRtl } = useI18n();
    const resolvedPlaceholder = placeholder ?? t("posts.bodyPh");
    const editorRef = useRef(null);
    const lastExternalValue = useRef(null);
    const skipNextSync = useRef(false);

    const getHTML = () => {
        if (!editorRef.current) return value || "";
        return sanitizeRichText(editorRef.current.innerHTML || "");
    };

    useImperativeHandle(ref, () => ({
        getHTML,
        focus: () => editorRef.current?.focus(),
    }));

    // Keep DOM in sync when parent value changes externally (open/edit/reset)
    useEffect(() => {
        if (!editorRef.current) return;
        if (skipNextSync.current) {
            skipNextSync.current = false;
            lastExternalValue.current = value;
            return;
        }
        if (value !== lastExternalValue.current) {
            editorRef.current.innerHTML = sanitizeRichText(value || "");
            lastExternalValue.current = value;
        }
    }, [value]);

    const emitChange = () => {
        if (!editorRef.current) return;
        const html = sanitizeRichText(editorRef.current.innerHTML);
        lastExternalValue.current = html;
        skipNextSync.current = true;
        onChange?.(html);
    };

    const runCommand = (tool) => {
        editorRef.current?.focus();

        if (tool.cmd === "createLink") {
            const url = window.prompt(t("editor.enterUrl"));
            if (!url || !isSafeHttpUrl(url)) return;
            document.execCommand("createLink", false, url);
        } else if (tool.cmd === "formatBlock") {
            document.execCommand("formatBlock", false, tool.value);
        } else {
            document.execCommand(tool.cmd, false, tool.value || null);
        }

        emitChange();
    };

    const plainText = (value || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

    return (
        <div className="simple-rich-text border rounded-3 overflow-hidden">
            <div className="d-flex flex-wrap gap-1 p-2 border-bottom bg-light">
                {TOOLS.map((tool) => (
                    <button
                        key={`${tool.cmd}-${tool.value || tool.label}`}
                        type="button"
                        className="btn btn-sm btn-white border fsz-12 px-2"
                        title={t(tool.titleKey)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => runCommand(tool)}
                    >
                        {tool.label || t(tool.labelKey)}
                    </button>
                ))}
            </div>
            <div
                ref={editorRef}
                className="simple-rich-text__editor p-3"
                contentEditable
                suppressContentEditableWarning
                data-placeholder={resolvedPlaceholder}
                dir={isRtl ? "rtl" : "ltr"}
                onInput={emitChange}
                onBlur={emitChange}
            />
            {required && (
                <input
                    tabIndex={-1}
                    aria-hidden="true"
                    className="position-absolute opacity-0"
                    style={{ height: 1, width: 1, left: 0, bottom: 0 }}
                    value={plainText ? "ok" : ""}
                    onChange={() => {}}
                    required
                />
            )}
        </div>
    );
});

export default SimpleRichTextEditor;
