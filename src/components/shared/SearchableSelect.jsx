"use client";

import Select from "react-select";
import { useI18n } from "@/hooks/useI18n";

export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder,
    isClearable = true,
    className = "",
    instanceId,
}) {
    const { t, isRtl } = useI18n();
    const resolvedPlaceholder = placeholder ?? t("common.select");
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
            placeholder={resolvedPlaceholder}
            isClearable={isClearable}
            isRtl={isRtl}
            noOptionsMessage={() => t("common.noOptions")}
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            menuPosition="fixed"
        />
    );
}
