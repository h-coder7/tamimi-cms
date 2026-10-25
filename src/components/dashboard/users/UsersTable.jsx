"use client";

import { useMemo, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { useAuth } from "@/providers/AuthProvider";
import UsersFilter from "./UsersFilter";
import SortableTh from "../../shared/table/SortableTh";
import SortableRow from "../../shared/table/SortableRow";
import { useI18n } from "@/hooks/useI18n";

export default function UsersTable({
    data = [],
    onEdit,
    onDelete,
}) {
    const { t, statusText } = useI18n();
    const { user: currentAdmin } = useAuth();
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const filteredData = useMemo(() => {
        const q = search.trim().toLowerCase();
        return data.filter((item) => {
            const matchesSearch =
                !q ||
                String(item.name || "").toLowerCase().includes(q) ||
                String(item.email || "").toLowerCase().includes(q);
            const matchesStatus = !statusFilter || item.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [data, search, statusFilter]);

    const columns = useMemo(() => [
        { id: "name", accessorKey: "name", header: t("common.name"), enableSorting: true },
        { id: "email", accessorKey: "email", header: t("common.email"), enableSorting: true },
        { id: "last_sign_in", accessorKey: "last_sign_in", header: t("admins.lastSignIn"), enableSorting: true },
        { id: "status", accessorKey: "status", header: t("common.status"), enableSorting: true },
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
    const pageIndex = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;

    const statusClass = (status) => {
        if (status === "Active") return "badge bg-success-subtle text-success border fsz-11";
        if (status === "Invited") return "badge bg-warning-subtle text-dark border fsz-11";
        return "badge bg-light text-dark border fsz-11";
    };

    return (
        <>
            <UsersFilter
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
                                        {t("admins.empty")}
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
                                                            <div className="fw-500 fsz-13">{item.name}</div>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "email") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="fsz-12 text-muted" dir="ltr">{item.email}</span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "last_sign_in") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="fsz-12 text-muted" dir="ltr">
                                                                {item.last_sign_in || "—"}
                                                            </span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "status") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className={statusClass(item.status)}>
                                                                {statusText(item.status || "Invited")}
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
                                                                            <i className="fal fa-pen me-2 text-muted"></i> {t("common.edit")}
                                                                        </button>
                                                                    </li>
                                                                    {item.id !== currentAdmin?.id && (
                                                                        <li>
                                                                            <button className="dropdown-item text-danger fsz-12 py-2" onClick={() => onDelete?.(item.id)}>
                                                                                <i className="fal fa-trash me-2 text-muted"></i> {t("common.delete")}
                                                                            </button>
                                                                        </li>
                                                                    )}
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
                    {t("common.showing", {
                        from: filteredCount === 0 ? 0 : pageIndex * pageSize + 1,
                        to: Math.min((pageIndex + 1) * pageSize, filteredCount),
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
                            page: pageIndex + 1,
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
