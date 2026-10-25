import DOMPurify from "dompurify";

const CONFIG = {
    ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "blockquote",
        "a",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
};

export function sanitizeRichText(html) {
    if (
        !html ||
        typeof window === "undefined" ||
        typeof DOMPurify.sanitize !== "function"
    ) {
        return "";
    }
    return DOMPurify.sanitize(html, CONFIG);
}

export function isSafeHttpUrl(raw) {
    try {
        const url = new URL(raw, window.location.origin);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}
