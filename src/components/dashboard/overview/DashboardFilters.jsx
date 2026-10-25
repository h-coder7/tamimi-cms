"use client";

import { useMemo, useState, useEffect } from "react";
import SearchableSelect from "@/components/shared/SearchableSelect";
import DateRangeModal from "@/components/shared/DateRangeModal";
import { useIndustries } from "@/hooks/useIndustries";
import { useUsers } from "@/hooks/useUsers";
import { buildIndustryFilterOptions } from "@/lib/industryOptions";
import { useI18n } from "@/hooks/useI18n";

export default function DashboardFilters() {
    const { t } = useI18n();
    const [employeeFilter, setEmployeeFilter] = useState(null);
    const [industryFilter, setIndustryFilter] = useState(null);
    const [periodFilter, setPeriodFilter] = useState("");
    const [dateRange, setDateRange] = useState([
        { startDate: null, endDate: null, key: "selection" },
    ]);
    const [tempRange, setTempRange] = useState([
        { startDate: null, endDate: null, key: "selection" },
    ]);
    const [showDateModal, setShowDateModal] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const { data: industries = [] } = useIndustries();
    const { data: users = [] } = useUsers();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const employeeOptions = useMemo(
        () =>
            (users || []).map((user) => ({
                value: user.id,
                label: user.name || user.email,
            })),
        [users]
    );

    const industryOptions = useMemo(
        () => buildIndustryFilterOptions(industries),
        [industries]
    );

    const periodOptions = useMemo(
        () => [
            { value: "week", label: t("overview.week") },
            { value: "month", label: t("overview.month") },
            { value: "quarter", label: t("overview.quarter") },
            { value: "year", label: t("overview.year") },
        ],
        [t]
    );

    const formatDateRangeDisplay = () => {
        const { startDate, endDate } = dateRange[0];
        if (!startDate || !endDate) return t("overview.selectRange");
        return isMounted
            ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            : t("overview.selectRange");
    };

    const confirmDateRange = (newRange) => {
        setDateRange(newRange);
        setTempRange(newRange);
        setShowDateModal(false);
    };

    return (
        <>
            <div className="d-flex align-items-center gap-2 flex-wrap">
                <div>
                    <SearchableSelect
                        options={employeeOptions}
                        value={employeeFilter}
                        onChange={setEmployeeFilter}
                        placeholder={t("overview.searchEmployee")}
                        instanceId="dashboard-employee-filter"
                    />
                </div>

                <div>
                    <SearchableSelect
                        options={industryOptions}
                        value={industryFilter}
                        onChange={setIndustryFilter}
                        placeholder={t("overview.searchIndustry")}
                        instanceId="dashboard-industry-filter"
                    />
                </div>

                <div>
                    <SearchableSelect
                        options={periodOptions}
                        value={periodFilter}
                        onChange={setPeriodFilter}
                        placeholder={t("overview.timePeriod")}
                        instanceId="dashboard-period-filter"
                    />
                </div>

                <div>
                    <button
                        className="butn-st2 line-butn py-2 px-3 d-flex align-items-center"
                        style={{ height: "38px", whiteSpace: "nowrap" }}
                        onClick={() => setShowDateModal(true)}
                    >
                        <i className="fal fa-calendar-alt me-2"></i>
                        <span className="fsz-13">{formatDateRangeDisplay()}</span>
                    </button>
                </div>
            </div>

            <DateRangeModal
                show={showDateModal}
                initialRange={tempRange}
                onClose={() => setShowDateModal(false)}
                onApply={confirmDateRange}
            />
        </>
    );
}
