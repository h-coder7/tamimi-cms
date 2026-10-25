"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths, format } from "date-fns";
import { ar as arLocale, enUS } from "date-fns/locale";
import { useI18n } from "@/hooks/useI18n";

export default function DateRangeModal({ show, onClose, onApply, initialRange }) {
    const { t, isRtl } = useI18n();
    const dateLocale = isRtl ? arLocale : enUS;
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
        if (!range[0].startDate || !range[0].endDate) return t("dateRange.title");
        const pattern = "MMM dd, yyyy";
        return `${format(range[0].startDate, pattern, { locale: dateLocale })} - ${format(range[0].endDate, pattern, { locale: dateLocale })}`;
    };

    return createPortal(
        <div className="rdr-modal-backdrop">
            <div className="rdr-modal-content">
                {/* Header */}
                <div className="rdr-header">
                    <h5>{t("dateRange.title")}</h5>
                    <div className="rdr-selected-display">
                        <i className="far fa-calendar-alt"></i>
                        {getRangeDisplay()}
                    </div>
                </div>

                <div className="rdr-modal-body">
                    {/* Presets Sidebar */}
                    <div className="rdr-presets">
                        <h6>{t("dateRange.quick")}</h6>
                        <button
                            className={activePreset === "today" ? "active" : ""}
                            onClick={() => applyPreset("today")}
                        >
                            {t("dateRange.today")}
                        </button>
                        <button
                            className={activePreset === "yesterday" ? "active" : ""}
                            onClick={() => applyPreset("yesterday")}
                        >
                            {t("dateRange.yesterday")}
                        </button>
                        <button
                            className={activePreset === "last7" ? "active" : ""}
                            onClick={() => applyPreset("last7")}
                        >
                            {t("dateRange.last7")}
                        </button>
                        <button
                            className={activePreset === "last30" ? "active" : ""}
                            onClick={() => applyPreset("last30")}
                        >
                            {t("dateRange.last30")}
                        </button>
                        <button
                            className={activePreset === "thisMonth" ? "active" : ""}
                            onClick={() => applyPreset("thisMonth")}
                        >
                            {t("dateRange.thisMonth")}
                        </button>
                        <button
                            className={activePreset === "lastMonth" ? "active" : ""}
                            onClick={() => applyPreset("lastMonth")}
                        >
                            {t("dateRange.lastMonth")}
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
                            locale={dateLocale}
                            showDateDisplay={false}
                            rangeColors={["#141414"]}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="rdr-footer">
                    <button className="btn-cancel" onClick={onClose}>
                        {t("dateRange.cancel")}
                    </button>
                    <button className="btn-apply" onClick={() => onApply(range)}>
                        {t("dateRange.apply")}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
