"use client";

import Select from "react-select";

export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    isClearable = true,
    className = "",
    instanceId,
}) {
    // Map existing value to react-select format { value, label }
    const selectedOption = options.find((opt) => opt.value === value) || null;

    return (
        <Select
            instanceId={instanceId}
            className={className}
            classNamePrefix="react-select"
            options={options}
            value={selectedOption}
            onChange={(selected) => onChange(selected ? selected.value : "")}
            placeholder={placeholder}
            isClearable={isClearable}
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            menuPosition="fixed"
        />
    );
}
