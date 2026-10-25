"use client";

import { useMemo, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import PagesFilter from "./PagesFilter";
import SortableTh from "../../shared/table/SortableTh";
import SortableRow from "../../shared/table/SortableRow";
import { useI18n } from "@/hooks/useI18n";

export default function PagesTable({
    data = [],
    onEditContent,
}) {
    const { t, statusText } = useI18n();
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const filteredData = useMemo(() => {
        const q = search.trim().toLowerCase();
        return data.filter((item) => {
            const matchesSearch =
                !q || String(item.page || "").toLowerCase().includes(q);
            const matchesStatus = !statusFilter || item.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [data, search, statusFilter]);

    const columns = useMemo(() => [
        { id: "page", accessorKey: "page", header: t("common.page"), enableSorting: true },
        { id: "url", accessorKey: "url", header: t("pages.col.url"), enableSorting: true },
        { id: "editable_fields", accessorKey: "editable_fields", header: t("pages.col.editable"), enableSorting: true },
        { id: "sections", accessorKey: "sections", header: t("pages.sections"), enableSorting: true },
        { id: "status", accessorKey: "status", header: t("common.status"), enableSorting: true },
        { id: "last_updated", accessorKey: "last_updated", header: t("pages.col.lastUpdated"), enableSorting: true },
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
        setStatusFilter("");
        setSorting([]);
    };

    const filteredCount = filteredData.length;

    return (
        <>
            <PagesFilter
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
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
                                        {t("pages.empty")}
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => {
                                    const item = row.original;
                                    return (
                                        <SortableRow key={row.id} items={columnOrder}>
                                            {columnOrder.map((colId) => {
                                                if (colId === "page") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <div className="fw-500 fsz-13">{item.page}</div>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "url") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="fsz-12 text-muted">{item.url}</span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "editable_fields" || colId === "sections") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="fsz-12">{item[colId] ?? 0}</span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "status") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="badge bg-light text-dark border fsz-11">
                                                                {statusText(item.status || "Draft")}
                                                            </span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "last_updated") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="fsz-12 text-muted">
                                                                {item.last_updated || "—"}
                                                            </span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "columnActions") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-main fsz-12"
                                                                onClick={() => onEditContent?.(item)}
                                                            >
                                                                <i className="fal fa-pen me-1"></i>
                                                                {t("pages.editContent")}
                                                            </button>
                                                        </td>
                                                    );
                                                }

                                                return <td key={colId} id={colId}>—</td>;
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
                    {t("common.showing", {
                        from: filteredCount === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1,
                        to: Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            filteredCount
                        ),
                        total: filteredCount,
                    })}
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                        <i className="fal fa-angle-double-left"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        <i className="fal fa-angle-left"></i>
                    </button>
                    <span className="d-flex align-items-center px-3 fsz-12 fw-500">
                        {t("common.pageOf", {
                            page: table.getState().pagination.pageIndex + 1,
                            pages: Math.max(table.getPageCount(), 1),
                        })}
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
