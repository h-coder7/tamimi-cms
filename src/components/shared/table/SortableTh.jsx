"use client";

/**
 * Table header cell that accepts an `id` used by SortableRow for column ordering.
 */
export default function SortableTh({ id: _id, disabled: _disabled, className = "", children, style, ...props }) {
    return (
        <th className={className} style={style} {...props}>
            <div className="d-flex align-items-center gap-2">
                {children}
            </div>
        </th>
    );
}
