"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import api from "@/app/api/api";

// Dynamic import for ApexCharts to handle SSR properly
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// =======================
// Original Data
// =======================
const FULL_DATA = [45, 52, 38, 65, 72, 58, 80, 75, 68, 82, 78, 85];
const FULL_CATEGORIES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MOBILE_DATA = [45, 38, 72, 80, 68, 78];
const MOBILE_CATEGORIES = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];

export default function LeadConversionChart() {
    const [series, setSeries] = useState([
        {
            name: "Conversion Rate (%)",
            data: FULL_DATA,
        }
    ]);

    const [categories, setCategories] = useState(FULL_CATEGORIES);

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
            categories: FULL_CATEGORIES,
        },
        yaxis: {
            title: {
                text: 'Conversion Rate (%)'
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
                name: "Conversion Rate (%)",
                data: isMobile ? MOBILE_DATA : FULL_DATA
            }]);

            setOptions(prev => ({
                ...prev,
                xaxis: {
                    categories: isMobile ? MOBILE_CATEGORIES : FULL_CATEGORIES
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
    }, []);

    return (
        <div className="card border-0 radius-15 p-4 mt-4">
            <div className="card-title py-2 pb-1 border-bottom">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h5 className="mb-0 fsz-18">Lead Conversion Rate</h5>
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
