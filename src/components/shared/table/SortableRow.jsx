"use client";

import { Children } from "react";

/**
 * Renders row children in a fixed column order (by child `id` prop).
 */
export default function SortableRow({ items, children, className = "" }) {
    const childrenArray = Children.toArray(children);

    const orderedChildren = items
        .map((id) => childrenArray.find((child) => child.props.id === id))
        .filter(Boolean);

    return <tr className={className}>{orderedChildren}</tr>;
}
