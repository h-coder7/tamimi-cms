"use client";

import { useMemo, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import MessagesFilter from "./MessagesFilter";
import SortableTh from "../../shared/table/SortableTh";
import SortableRow from "../../shared/table/SortableRow";
import { publicPath } from "@/utils/publicPath";
import { useCompanies } from "@/hooks/useCompanies";
import { buildCompanyFilterOptions } from "@/lib/companyOptions";
import { useI18n } from "@/hooks/useI18n";

const TYPE_KEY = {
    Inquiry: "inquiry",
    Contact: "contact",
    Application: "application",
};

export default function MessagesTable({
    data = [],
    companiesByCode = {},
    onView,
    onMarkUnread,
    onDelete,
}) {
    const { t, statusText, text } = useI18n();
    const [sorting, setSorting] = useState([{ id: "received_at", desc: true }]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const [search, setSearch] = useState("");
    const [companyFilter, setCompanyFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const { data: companies = [] } = useCompanies();

    const companyOptions = useMemo(() => {
        return buildCompanyFilterOptions(companies, { includeGroup: true }).map((opt) => {
            if (opt.value === "TEG") return { ...opt, label: statusText("group") };
            const company = companies.find((item) => (item.code || item.id) === opt.value);
            if (!company) return opt;
            const name = text(company.i18nTitle, company.title || "");
            return {
                ...opt,
                label: company.code ? `${company.code} — ${name}`.trim() : name || opt.label,
            };
        });
    }, [companies, statusText, text]);

    const filteredData = useMemo(() => {
        const q = search.trim().toLowerCase();
        return data.filter((item) => {
            const matchesSearch =
                !q ||
                String(item.name || "").toLowerCase().includes(q) ||
                String(item.email || "").toLowerCase().includes(q) ||
                String(item.subject || "").toLowerCase().includes(q);
            const matchesCompany =
                !companyFilter || item.company_code === companyFilter;
            const matchesStatus = !statusFilter || item.status === statusFilter;
            return matchesSearch && matchesCompany && matchesStatus;
        });
    }, [data, search, companyFilter, statusFilter]);

    const columns = useMemo(() => [
        { id: "from", accessorKey: "name", header: t("messages.from"), enableSorting: true },
        { id: "type", accessorKey: "type", header: t("common.type"), enableSorting: true },
        { id: "company", accessorKey: "company_label", header: t("messages.target"), enableSorting: true },
        { id: "subject", accessorKey: "subject", header: t("common.subject"), enableSorting: true },
        { id: "received_at", accessorKey: "received_at", header: t("common.date"), enableSorting: true },
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
        setCompanyFilter("");
        setStatusFilter("");
        setSorting([{ id: "received_at", desc: true }]);
    };

    const filteredCount = filteredData.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;

    const statusClass = (status) => {
        if (status === "New") return "badge bg-warning-subtle text-dark border fsz-11";
        return "badge bg-light text-dark border fsz-11";
    };

    const companyLabel = (item) => {
        if (item.company_code === "TEG") return statusText("group");
        const company = companiesByCode[item.company_code];
        if (company?.i18nTitle || company?.title) {
            return text(company.i18nTitle, company.title || item.company_label || "");
        }
        return item.company_label || item.company_code || "—";
    };

    return (
        <>
            <MessagesFilter
                search={search}
                onSearchChange={setSearch}
                companyFilter={companyFilter}
                onCompanyChange={setCompanyFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                companyOptions={companyOptions}
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
                                        </SortableTh>
                                    );
                                })}
                            </SortableRow>
                        </thead>

                        <tbody>
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columnOrder.length} className="text-center py-4 text-muted fsz-12">
                                        {t("messages.empty")}
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => {
                                    const item = row.original;
                                    const company = companiesByCode[item.company_code];

                                    return (
                                        <SortableRow key={row.id} items={columnOrder}>
                                            {columnOrder.map((colId) => {
                                                if (colId === "from") {
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

                                                if (colId === "type") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="fsz-12">{statusText(TYPE_KEY[item.type] || item.type)}</span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "company") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <div className="d-flex align-items-center gap-2">
                                                                {(company?.image || item.company_code === "TEG") && (
                                                                    <div className="icon-30 p-1 rounded-circle border overflow-hidden bg-light d-flex align-items-center justify-content-center">
                                                                        <img
                                                                            src={publicPath(company?.image || "/images/logo.png")}
                                                                            alt=""
                                                                            className="img-contain h-100 w-100"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <span className="fsz-12">{companyLabel(item)}</span>
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "subject") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="fsz-12">{item.subject || "—"}</span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "received_at") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="fsz-12 text-muted" dir="ltr">{item.received_at || "—"}</span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "status") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className={statusClass(item.status)}>
                                                                {statusText(item.status || "New")}
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
                                                                        <button className="dropdown-item fsz-12 py-2" onClick={() => onView?.(item)}>
                                                                            <i className="fal fa-eye me-2 text-muted"></i> {t("common.view")}
                                                                        </button>
                                                                    </li>
                                                                    {item.status === "Read" && (
                                                                        <li>
                                                                            <button
                                                                                className="dropdown-item fsz-12 py-2"
                                                                                onClick={() => onMarkUnread?.(item)}
                                                                            >
                                                                                <i className="fal fa-envelope me-2 text-muted"></i> {t("messages.unread")}
                                                                            </button>
                                                                        </li>
                                                                    )}
                                                                    <li>
                                                                        <button
                                                                            className="dropdown-item fsz-12 py-2 text-danger"
                                                                            onClick={() => onDelete?.(item)}
                                                                        >
                                                                            <i className="fal fa-trash me-2"></i> {t("common.delete")}
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
