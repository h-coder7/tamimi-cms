"use client";

import { useMemo, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import SeoFilter from "./SeoFilter";
import SortableTh from "../../shared/table/SortableTh";
import SortableRow from "../../shared/table/SortableRow";
import { TITLE_MAX, DESC_MAX } from "@/hooks/useSeo";

export default function SeoTable({
    data = [],
    onEdit,
}) {
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const [search, setSearch] = useState("");
    const [healthFilter, setHealthFilter] = useState("");

    const filteredData = useMemo(() => {
        const q = search.trim().toLowerCase();
        return data.filter((item) => {
            const matchesSearch =
                !q ||
                String(item.page || "").toLowerCase().includes(q) ||
                String(item.meta_title || "").toLowerCase().includes(q);
            const matchesHealth = !healthFilter || item.health === healthFilter;
            return matchesSearch && matchesHealth;
        });
    }, [data, search, healthFilter]);

    const columns = useMemo(() => [
        { id: "page", accessorKey: "page", header: "Page", enableSorting: true },
        { id: "meta_title", accessorKey: "meta_title", header: "Meta title", enableSorting: true },
        { id: "title", accessorKey: "title_length", header: "Title", enableSorting: true },
        { id: "description", accessorKey: "description_length", header: "Description", enableSorting: true },
        { id: "health", accessorKey: "health", header: "Health", enableSorting: true },
        { id: "columnActions", header: "Actions", enableSorting: false },
    ], []);

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
        setHealthFilter("");
        setSorting([]);
    };

    const filteredCount = filteredData.length;

    const healthClass = (health) => {
        if (health === "Good") return "badge bg-success-subtle text-success border fsz-11";
        if (health === "Weak") return "badge bg-warning-subtle text-dark border fsz-11";
        return "badge bg-danger-subtle text-danger border fsz-11";
    };

    const lengthClass = (len, max) => {
        if (len === 0) return "text-danger";
        if (len > max) return "text-warning";
        return "text-muted";
    };

    return (
        <>
            <SeoFilter
                search={search}
                onSearchChange={setSearch}
                healthFilter={healthFilter}
                onHealthChange={setHealthFilter}
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
                                                Actions
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
                                                        <i className="fal fa-sort-alpha-up me-2 text-muted"></i> (A → Z)
                                                    </li>
                                                    <li className="dropdown-item cursor-pointer fsz-12 py-2" onClick={() => column.toggleSorting(true)}>
                                                        <i className="fal fa-sort-alpha-down me-2 text-muted"></i> (Z → A)
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
                                        No pages found
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

                                                if (colId === "meta_title") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="fsz-12">
                                                                {item.meta_title?.trim() ? item.meta_title : "—"}
                                                            </span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "title") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className={`fsz-12 ${lengthClass(item.title_length, TITLE_MAX)}`}>
                                                                {item.title_length} / {TITLE_MAX}
                                                            </span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "description") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className={`fsz-12 ${lengthClass(item.description_length, DESC_MAX)}`}>
                                                                {item.description_length} / {DESC_MAX}
                                                            </span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "health") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className={healthClass(item.health)}>
                                                                {item.health || "Missing"}
                                                            </span>
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
                                                                        <button className="dropdown-item fsz-12 py-2" onClick={() => onEdit?.(item)}>
                                                                            <i className="fal fa-pen me-2 text-muted"></i> Edit
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
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
                    Showing {filteredCount === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                    {Math.min(
                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                        filteredCount
                    )}{" "}
                    of {filteredCount} entries
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                        <i className="fal fa-angle-double-left"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        <i className="fal fa-angle-left"></i>
                    </button>
                    <span className="d-flex align-items-center px-3 fsz-12 fw-500">
                        Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
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
