"use client";

import { useMemo, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import ApplicationsFilter from "./ApplicationsFilter";
import SortableTh from "../../shared/table/SortableTh";
import SortableRow from "../../shared/table/SortableRow";
import { useJobs } from "@/hooks/useJobs";
import { buildJobFilterOptions } from "@/lib/jobOptions";
import { useI18n } from "@/hooks/useI18n";

function matchesDateFilter(appliedAt, dateFilter) {
    if (!dateFilter || !appliedAt) return !dateFilter;
    const applied = new Date(appliedAt);
    if (Number.isNaN(applied.getTime())) return false;

    const today = new Date("2026-10-06T00:00:00");
    const days = Number(String(dateFilter).replace("d", ""));
    if (!days) return true;

    const start = new Date(today);
    start.setDate(start.getDate() - days);
    return applied >= start && applied <= today;
}

function yearsLabel(item, t) {
    const n = item.experience_years;
    if (n == null || n === "") return "—";
    const num = Number(n);
    if (!Number.isFinite(num)) return item.experience_label || "—";
    return t(num === 1 ? "applications.yearCount" : "applications.yearsCount", { count: num });
}

export default function ApplicationsTable({
    data = [],
    onView,
}) {
    const { t, text } = useI18n();
    const [sorting, setSorting] = useState([{ id: "applied_at", desc: true }]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const [search, setSearch] = useState("");
    const [jobFilter, setJobFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const { data: jobs = [] } = useJobs();

    const jobOptions = useMemo(() => {
        const byId = new Map(jobs.map((job) => [job.id, job]));
        return buildJobFilterOptions(jobs).map((opt) => {
            const job = byId.get(opt.value);
            if (!job) return opt;
            return { ...opt, label: text(job.i18nTitle, job.title) };
        });
    }, [jobs, text]);

    const filteredData = useMemo(() => {
        const q = search.trim().toLowerCase();
        return data.filter((item) => {
            const matchesSearch =
                !q ||
                String(item.name || "").toLowerCase().includes(q) ||
                String(item.email || "").toLowerCase().includes(q);
            const matchesJob =
                !jobFilter ||
                item.job_id === jobFilter ||
                item.job_title === jobFilter;
            const matchesDate = !dateFilter || matchesDateFilter(item.applied_at, dateFilter);
            return matchesSearch && matchesJob && matchesDate;
        });
    }, [data, search, jobFilter, dateFilter]);

    const columns = useMemo(() => [
        { id: "name", accessorKey: "name", header: t("applications.applicant"), enableSorting: true },
        { id: "job", accessorKey: "job_title", header: t("applications.job"), enableSorting: true },
        { id: "applied_at", accessorKey: "applied_at", header: t("common.date"), enableSorting: true },
        { id: "experience", accessorKey: "experience_label", header: t("common.experience"), enableSorting: true },
        { id: "city", accessorKey: "city", header: t("common.city"), enableSorting: true },
        { id: "columnActions", header: t("common.actions"), enableSorting: false },
    ], [t]);

    const columnOrder = useMemo(() => columns.map((c) => c.id), [columns]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const resetAllFilters = () => {
        setSearch("");
        setJobFilter("");
        setDateFilter("");
        setSorting([{ id: "applied_at", desc: true }]);
    };

    const filteredCount = filteredData.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;
    const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
    const to = Math.min((pageIndex + 1) * pageSize, filteredCount);
    const pages = Math.max(table.getPageCount(), 1);

    return (
        <>
            <ApplicationsFilter
                search={search}
                onSearchChange={setSearch}
                jobFilter={jobFilter}
                onJobChange={setJobFilter}
                dateFilter={dateFilter}
                onDateChange={setDateFilter}
                jobOptions={jobOptions}
                onReset={resetAllFilters}
            />

            <div className="table-content">
                <div className="table-responsive position-relative">
                    <table className="table align-middle">
                        <thead>
                            <SortableRow items={columnOrder}>
                                {columnOrder.map((id) => {
                                    const column = table.getColumn(id);
                                    if (id === "columnActions") {
                                        return (
                                            <SortableTh id={id} key={id} disabled>
                                                {t("common.actions")}
                                            </SortableTh>
                                        );
                                    }
                                    return (
                                        <SortableTh id={id} key={id}>
                                            <span>{column.columnDef.header || id}</span>
                                            <div className="dropdown ms-auto" onClick={(e) => e.stopPropagation()}>
                                                <button className="btn bg-transparent border-0 p-0" data-bs-toggle="dropdown">
                                                    <i className="fat fa-sort fsz-12"></i>
                                                </button>
                                                <ul className="dropdown-menu shadow-sm border-0 rounded-3">
                                                    <li className="dropdown-item cursor-pointer fsz-12 py-2" onClick={() => column.toggleSorting(false)}>
                                                        <i className="fal fa-sort-alpha-up me-2 text-muted"></i> {t("common.sortAz")}
                                                    </li>
                                                    <li className="dropdown-item cursor-pointer fsz-12 py-2" onClick={() => column.toggleSorting(true)}>
                                                        <i className="fal fa-sort-alpha-down me-2 text-muted"></i> {t("common.sortZa")}
                                                    </li>
                                                </ul>
                                            </div>
                                        </SortableTh>
                                    );
                                })}
                            </SortableRow>
                        </thead>

                        <tbody>
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columnOrder.length} className="text-center py-4 text-muted fsz-12">
                                        {t("applications.empty")}
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => {
                                    const item = row.original;

                                    return (
                                        <SortableRow key={row.id} items={columnOrder}>
                                            {columnOrder.map((colId) => {
                                                if (colId === "name") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <div
                                                                className="hover-underline fw-500 fsz-13"
                                                                onClick={() => onView?.(item)}
                                                                style={{ cursor: "pointer" }}
                                                            >
                                                                {item.name}
                                                            </div>
                                                            <small className="text-muted fsz-11" dir="ltr">{item.email}</small>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "job") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="fsz-12">{text(item.job_title) || "—"}</span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "applied_at") {
                                                    return (
                                                        <td key={colId} id={colId} dir="ltr">
                                                            <span className="fsz-12 text-muted">{item.applied_at || "—"}</span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "experience") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="fsz-12">{yearsLabel(item, t)}</span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "city") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="fsz-12">{item.city || "—"}</span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "columnActions") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <div className="dropdown">
                                                                <button className="btn bg-transparent border-0 p-0" data-bs-toggle="dropdown">
                                                                    <i className="fas fa-ellipsis fsz-14 text-muted"></i>
                                                                </button>
                                                                <ul className="dropdown-menu shadow-sm border-0 rounded-3">
                                                                    <li>
                                                                        <button className="dropdown-item fsz-12 py-2" onClick={() => onView?.(item)}>
                                                                            <i className="fal fa-eye me-2 text-muted"></i> {t("common.view")}
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                return (
                                                    <td key={colId} id={colId}>—</td>
                                                );
                                            })}
                                        </SortableRow>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 react-pagination">
                <div className="text-muted fsz-12">
                    {t("common.showing", { from, to, total: filteredCount })}
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                        <i className="fal fa-angle-double-left"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        <i className="fal fa-angle-left"></i>
                    </button>
                    <span className="d-flex align-items-center px-3 fsz-12 fw-500">
                        {t("common.pageOf", { page: pageIndex + 1, pages })}
                    </span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        <i className="fal fa-angle-right"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                        <i className="fal fa-angle-double-right"></i>
                    </button>
                </div>
            </div>
        </>
    );
}
