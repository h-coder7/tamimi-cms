"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useI18n } from "@/hooks/useI18n";

// Use dynamic import for ApexCharts to avoid SSR issues in Next.js
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function SalesTowardsTargets() {
    const { t } = useI18n();
    const [series] = useState([75]); // 75% towards target

    const [options] = useState({
        // ... (rest of options)
        chart: {
            height: 400,
            type: 'radialBar',
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 225,
                hollow: {
                    margin: 0,
                    size: '70%',
                    background: '#fff',
                    image: undefined,
                    imageOffsetX: 0,
                    imageOffsetY: 0,
                    position: 'front',
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 0,
                        blur: 4,
                        opacity: 0.24
                    }
                },
                track: {
                    background: '#f2f2f2',
                    strokeWidth: '100%',
                    margin: 0, // margin is in pixels
                    dropShadow: {
                        enabled: true,
                        top: -3,
                        left: 0,
                        blur: 4,
                        opacity: 0.35
                    }
                },

                dataLabels: {
                    show: true,
                    name: {
                        offsetY: -10,
                        show: true,
                        color: '#888',
                        fontSize: '14px'
                    },
                    value: {
                        formatter: function (val) {
                            return parseInt(val) + "%";
                        },
                        color: '#111',
                        fontSize: '30px',
                        show: true,
                    }
                }
            }
        },
        fill: {
            type: 'gradient',
            colors: ['#C6A15B'],
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: ['#59f49aff'],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            }
        },
        stroke: {
            lineCap: 'round'
        },
        labels: ['Sales Target'],
    });

    const chartOptions = useMemo(
        () => ({ ...options, labels: [t("overview.chart.salesTarget")] }),
        [options, t]
    );

    return (
        <div className="card border-0 radius-15 p-4 mt-4">
            <div className="card-title py-2 pb-1 border-bottom">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h5 className="mb-0 fsz-18">{t("overview.chart.sales")}</h5>
                </div>
            </div>
            <div className="card-body">
                <div id="chart">
                    <Chart options={chartOptions} series={series} type="radialBar" height={400} />
                </div>
            </div>
        </div>
    );
}
