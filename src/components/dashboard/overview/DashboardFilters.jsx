"use client";

import { useState, useEffect } from "react";
import SearchableSelect from "@/components/shared/SearchableSelect";
import DateRangeModal from "@/components/shared/DateRangeModal";

export default function DashboardFilters() {
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

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Mock Options
    const employeeOptions = [
        { value: "emp1", label: "John Doe" },
        { value: "emp2", label: "Jane Smith" },
        { value: "emp3", label: "Mike Johnson" },
    ];

    const industryOptions = [
        { value: "ind1", label: "Tech Industry" },
        { value: "ind2", label: "Real Estate" },
        { value: "ind3", label: "Finance" },
    ];

    const periodOptions = [
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
        { value: "quarter", label: "Quarter" },
        { value: "year", label: "Year" },
    ];

    const formatDateRangeDisplay = () => {
        const { startDate, endDate } = dateRange[0];
        if (!startDate || !endDate) return "Select Date Range";
        return isMounted ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` : "Select Date Range";
    };

    const confirmDateRange = (newRange) => {
        setDateRange(newRange);
        setTempRange(newRange);
        setShowDateModal(false);
        console.log("Date range confirmed:", newRange);
    };

    return (
        <>
            <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* Employee Search */}
                <div>
                    <SearchableSelect
                        options={employeeOptions}
                        value={employeeFilter}
                        onChange={(val) => {
                            setEmployeeFilter(val);
                            console.log("Employee filter:", val);
                        }}
                        placeholder="Search Employee..."
                        instanceId="dashboard-employee-filter"
                    />
                </div>

                {/* Industry Search */}
                <div>
                    <SearchableSelect
                        options={industryOptions}
                        value={industryFilter}
                        onChange={(val) => {
                            setIndustryFilter(val);
                            console.log("Industry filter:", val);
                        }}
                        placeholder="Search Industry..."
                        instanceId="dashboard-industry-filter"
                    />
                </div>

                {/* Time Period Select */}
                <div>
                    <SearchableSelect
                        options={periodOptions}
                        value={periodFilter}
                        onChange={(val) => {
                            setPeriodFilter(val);
                            console.log("Period changed:", val);
                        }}
                        placeholder="Time Period"
                        instanceId="dashboard-period-filter"
                    />
                </div>

                {/* Date Range Picker Button */}
                <div>
                    <button
                        className="butn-st2 line-butn py-2 px-3 d-flex align-items-center"
                        style={{ height: '38px', whiteSpace: "nowrap" }}
                        onClick={() => setShowDateModal(true)}
                    >
                        <i className="fal fa-calendar-alt me-2"></i>
                        <span className="fsz-13">{formatDateRangeDisplay()}</span>
                    </button>
                </div>
            </div>

            {/* Date Range Modal (Portaled) */}
            {/* Date Range Modal (Shared) */}
            <DateRangeModal
                show={showDateModal}
                initialRange={tempRange}
                onClose={() => setShowDateModal(false)}
                onApply={confirmDateRange}
            />
        </>
    );
}
