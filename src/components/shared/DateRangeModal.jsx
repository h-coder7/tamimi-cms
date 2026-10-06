"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DateRange } from "react-date-range";
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths, format } from "date-fns";

export default function DateRangeModal({ show, onClose, onApply, initialRange }) {
    const [range, setRange] = useState([{
        startDate: null,
        endDate: null,
        key: 'selection'
    }]);

    useEffect(() => {
        if (!initialRange) {
            setRange([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
        }
    }, [initialRange]);

    const [activePreset, setActivePreset] = useState("today");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (show && initialRange && initialRange[0]?.startDate) {
            setRange(initialRange);
        } else if (show) {
            // Default to empty or today? Admin table uses null, but DateRange needs valid dates sometimes to show calendar correctly.
            // Let's keep it sync with prop or fallback to today.
            setRange([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
            setActivePreset("");
        }
    }, [show, initialRange]);

    if (!isMounted || !show) return null;

    const handleSelect = (ranges) => {
        setRange([ranges.selection]);
        setActivePreset("custom");
    };

    const applyPreset = (preset) => {
        setActivePreset(preset);
        const now = new Date();
        let newRange = { startDate: now, endDate: now, key: 'selection' };

        switch (preset) {
            case "today":
                newRange = { startDate: now, endDate: now, key: 'selection' };
                break;
            case "yesterday":
                const yest = subDays(now, 1);
                newRange = { startDate: yest, endDate: yest, key: 'selection' };
                break;
            case "last7":
                newRange = { startDate: subDays(now, 6), endDate: now, key: 'selection' }; // 7 days including today
                break;
            case "last30":
                newRange = { startDate: subDays(now, 29), endDate: now, key: 'selection' };
                break;
            case "thisMonth":
                newRange = { startDate: startOfMonth(now), endDate: endOfMonth(now), key: 'selection' };
                break;
            case "lastMonth":
                const lastMonth = subMonths(now, 1);
                newRange = { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth), key: 'selection' };
                break;
            default:
                break;
        }
        setRange([newRange]);
    };

    const getRangeDisplay = () => {
        if (!range[0].startDate || !range[0].endDate) return "Select Range";
        return `${format(range[0].startDate, "MMM dd, yyyy")} - ${format(range[0].endDate, "MMM dd, yyyy")}`;
    };

    return createPortal(
        <div className="rdr-modal-backdrop" onClick={onClose}>
            <div className="rdr-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="rdr-header">
                    <h5>Select Date Range</h5>
                    <div className="rdr-selected-display">
                        <i className="far fa-calendar-alt"></i>
                        {getRangeDisplay()}
                    </div>
                </div>

                <div className="rdr-modal-body">
                    {/* Presets Sidebar */}
                    <div className="rdr-presets">
                        <h6>Quick Select</h6>
                        <button
                            className={activePreset === "today" ? "active" : ""}
                            onClick={() => applyPreset("today")}
                        >
                            Today
                        </button>
                        <button
                            className={activePreset === "yesterday" ? "active" : ""}
                            onClick={() => applyPreset("yesterday")}
                        >
                            Yesterday
                        </button>
                        <button
                            className={activePreset === "last7" ? "active" : ""}
                            onClick={() => applyPreset("last7")}
                        >
                            Last 7 Days
                        </button>
                        <button
                            className={activePreset === "last30" ? "active" : ""}
                            onClick={() => applyPreset("last30")}
                        >
                            Last 30 Days
                        </button>
                        <button
                            className={activePreset === "thisMonth" ? "active" : ""}
                            onClick={() => applyPreset("thisMonth")}
                        >
                            This Month
                        </button>
                        <button
                            className={activePreset === "lastMonth" ? "active" : ""}
                            onClick={() => applyPreset("lastMonth")}
                        >
                            Last Month
                        </button>
                    </div>

                    {/* Calendar */}
                    <div className="rdr-calendar-wrapper">
                        <DateRange
                            ranges={range}
                            onChange={handleSelect}
                            editableDateInputs={false}
                            moveRangeOnFirstSelection={false}
                            months={2}
                            direction="horizontal"
                            showDateDisplay={false} // We typically hide default display to use our own or let it be 
                            rangeColors={["#141414"]} // Fallback if CSS variable doesn't load immediately
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="rdr-footer">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn-apply" onClick={() => onApply(range)}>
                        Apply Range
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
