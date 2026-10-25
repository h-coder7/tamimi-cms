"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import api from "@/app/api/api";
import { useI18n } from "@/hooks/useI18n";

// Dynamic import for ApexCharts to handle SSR properly
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// =======================
// Original Data
// =======================
const FULL_DATA = [45, 52, 38, 65, 72, 58, 80, 75, 68, 82, 78, 85];
const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MOBILE_MONTH_KEYS = ["jan", "mar", "may", "jul", "sep", "nov"];
const MOBILE_DATA = [45, 38, 72, 80, 68, 78];

export default function LeadConversionChart() {
    const { t } = useI18n();
    const fullCategories = useMemo(
        () => MONTH_KEYS.map((key) => t(`overview.month.${key}`)),
        [t]
    );
    const mobileCategories = useMemo(
        () => MOBILE_MONTH_KEYS.map((key) => t(`overview.month.${key}`)),
        [t]
    );
    const chartName = t("overview.chart.conversion");

    const [series, setSeries] = useState([
        {
            name: chartName,
            data: FULL_DATA,
        }
    ]);

    const [options, setOptions] = useState({
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 10,
                dataLabels: {
                    position: 'top',
                },
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => `${val}%`,
            offsetY: -20,
            style: {
                fontSize: '12px',
                colors: ["#8c6a2f"]
            }
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: fullCategories,
        },
        yaxis: {
            title: {
                text: chartName
            },
            max: 100
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: "vertical",
                shadeIntensity: 0.25,
                gradientToColors: ["#2DD975"],
                inverseColors: false,
                opacityFrom: 0.85,
                opacityTo: 0.55,
                stops: [0, 90, 100]
            },
        },
        colors: ["#C6A15B"],
        tooltip: {
            y: {
                formatter: (val) => `${val}%`
            }
        },
        grid: {
            borderColor: '#f1f1f1',
        }
    });

    // =======================
    // Responsive Logic
    // =======================
    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;

            setSeries([{
                name: chartName,
                data: isMobile ? MOBILE_DATA : FULL_DATA
            }]);

            setOptions(prev => ({
                ...prev,
                xaxis: {
                    categories: isMobile ? mobileCategories : fullCategories
                },
                yaxis: {
                    ...prev.yaxis,
                    title: { text: chartName },
                },
                plotOptions: {
                    bar: {
                        ...prev.plotOptions.bar,
                        columnWidth: isMobile ? '70%' : '55%',
                    }
                }
            }));
        };

        handleResize(); // run on mount
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [chartName, fullCategories, mobileCategories]);

    return (
        <div className="card border-0 radius-15 p-4 mt-4">
            <div className="card-title py-2 pb-1 border-bottom">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h5 className="mb-0 fsz-18">{t("overview.chart.lead")}</h5>
                </div>
            </div>

            <div className="card-body">
                <Chart
                    options={options}
                    series={series}
                    type="bar"
                    height={350}
                />
            </div>
        </div>
    );
}
