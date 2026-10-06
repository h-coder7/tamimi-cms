const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function publicPath(path) {
    if (!path || /^(?:https?:|data:|blob:)/.test(path)) return path;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const stripped = normalized.replace(/^\/crm-skybridge(?=\/|$)/, "");
    return `${basePath}${stripped}`;
}
