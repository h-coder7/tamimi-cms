"use client";

import { useMemo, useState, useEffect } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import CompaniesFilter from "./CompaniesFilter";
import SortableTh from "../../shared/table/SortableTh";
import SortableRow from "../../shared/table/SortableRow";
import { publicPath } from "@/utils/publicPath";
import { useIndustries } from "@/hooks/useIndustries";
import { buildIndustryFilterOptions } from "@/lib/industryOptions";
import { useI18n } from "@/hooks/useI18n";

export default function CompaniesTable({
    data = [],
    selectedIds = [],
    onSelectionChange,
    onEdit,
    onDelete,
    onView
}) {
    const { t, statusText, text } = useI18n();
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const [columnVisibility, setColumnVisibility] = useState({});
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [industryFilter, setIndustryFilter] = useState("");
    const { data: industries = [] } = useIndustries();

    const industryOptions = useMemo(
        () => buildIndustryFilterOptions(industries).map((opt) => {
            const industry = industries.find((item) => item.title === opt.value || item.id === opt.value);
            return {
                ...opt,
                label: industry ? text(industry.i18nTitle, opt.label) : opt.label,
            };
        }),
        [industries, text]
    );

    const filteredData = useMemo(() => {
        const q = search.trim().toLowerCase();
        return data.filter((item) => {
            const titleBlob = [item.title, item.i18nTitle?.en, item.i18nTitle?.ar, item.code]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            const matchesSearch = !q || titleBlob.includes(q);
            const matchesType = !typeFilter || item.type === typeFilter;
            const matchesIndustry =
                !industryFilter || (item.industries || []).includes(industryFilter);
            return matchesSearch && matchesType && matchesIndustry;
        });
    }, [data, search, typeFilter, industryFilter]);

    useEffect(() => {
        const newSelection = {};
        selectedIds.forEach((id) => {
            const index = filteredData.findIndex((item) => item.id === id);
            if (index !== -1) newSelection[index] = true;
        });
        setRowSelection(newSelection);
    }, [selectedIds, filteredData]);

    const columns = useMemo(() => [
        {
            id: "title",
            accessorKey: "title",
            header: t("common.company"),
            enableSorting: true,
        },
        {
            id: "type",
            accessorKey: "type",
            header: t("common.type"),
            enableSorting: true,
        },
        {
            id: "field",
            accessorKey: "field",
            header: t("common.field"),
            enableSorting: true,
        },
        {
            id: "industries",
            accessorKey: "industries_label",
            header: t("common.industries"),
            enableSorting: true,
        },
        {
            id: "website",
            accessorKey: "website",
            header: t("common.website"),
            enableSorting: true,
        },
        {
            id: "status",
            accessorKey: "status",
            header: t("common.status"),
            enableSorting: true,
        },
        {
            id: "columnActions",
            header: t("common.actions"),
            enableSorting: false,
        },
    ], [t]);

    const columnOrder = useMemo(() => columns.map((c) => c.id), [columns]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, rowSelection, pagination, columnVisibility },
        enableRowSelection: true,
        onRowSelectionChange: (updater) => {
            const nextSelection = typeof updater === "function" ? updater(rowSelection) : updater;
            setRowSelection(nextSelection);

            const selectedIdsList = Object.keys(nextSelection)
                .filter((key) => nextSelection[key])
                .map((index) => filteredData[index]?.id)
                .filter(Boolean);

            onSelectionChange?.(selectedIdsList);
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const resetAllFilters = () => {
        setSearch("");
        setTypeFilter("");
        setIndustryFilter("");
        setSorting([]);
    };

    const visibleColumnOrder = useMemo(() => {
        return columnOrder.filter((id) => table.getColumn(id)?.getIsVisible());
    }, [columnOrder, columnVisibility, table]);

    const filteredCount = filteredData.length;

    const resolveImage = (image) => {
        if (!image) return "";
        return publicPath(image);
    };

    const isPendingWebsite = (website) =>
        !website || String(website).toLowerCase().includes("pending");

    return (
        <>
            <CompaniesFilter
                search={search}
                onSearchChange={setSearch}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                industryFilter={industryFilter}
                onIndustryChange={setIndustryFilter}
                industryOptions={industryOptions}
                onReset={resetAllFilters}
            />

            <div className="table-content">
                <div className="table-responsive position-relative">
                    <table className="table align-middle">
                        <thead>
                            <SortableRow items={visibleColumnOrder}>
                                {table.getColumn("title").getIsVisible() && (
                                    <SortableTh id="title" key="title" disabled className="position-relative ps-5">
                                        <div className="form-check position-absolute top-50 start-0 translate-middle ms-4">
                                            <input
                                                className="form-check-input mt-0 cursor-pointer"
                                                id="select-all-companies"
                                                type="checkbox"
                                                checked={table.getIsAllPageRowsSelected()}
                                                onChange={table.getToggleAllPageRowsSelectedHandler()}
                                            />
                                            <label className="form-check-label" htmlFor="select-all-companies"></label>
                                        </div>
                                        <span>{t("common.company")}</span>
                                        <div className="dropdown ms-auto" onClick={(e) => e.stopPropagation()}>
                                            <button className="btn bg-transparent border-0 p-0" data-bs-toggle="dropdown">
                                                <i className="fat fa-sort fsz-12"></i>
                                            </button>
                                            <ul className="dropdown-menu shadow-sm border-0 rounded-3">
                                                <li className="dropdown-item cursor-pointer fsz-12 py-2" onClick={() => table.getColumn("title").toggleSorting(false)}>
                                                    <i className="fal fa-sort-alpha-up me-2 text-muted"></i> {t("common.sortAz")}
                                                </li>
                                                <li className="dropdown-item cursor-pointer fsz-12 py-2" onClick={() => table.getColumn("title").toggleSorting(true)}>
                                                    <i className="fal fa-sort-alpha-down me-2 text-muted"></i> {t("common.sortZa")}
                                                </li>
                                            </ul>
                                        </div>
                                    </SortableTh>
                                )}

                                {visibleColumnOrder
                                    .filter((id) => !["title", "columnActions"].includes(id))
                                    .map((id) => {
                                        const column = table.getColumn(id);
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

                                {table.getColumn("columnActions").getIsVisible() && (
                                    <SortableTh id="columnActions" key="columnActions" disabled>
                                        <div className="dropdown icon-30 ms-auto">
                                            <button className="btn bg-white border-0 p-0 icon-30" data-bs-toggle="dropdown" type="button" data-bs-auto-close="outside">
                                                <i className="fas fa-ellipsis-v fsz-12"></i>
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 p-3" onClick={(e) => e.stopPropagation()}>
                                                <h6 className="fsz-11 text-uppercase fw-600 text-muted mb-3 border-bottom pb-2">{t("common.toggleColumns")}</h6>
                                                {table.getAllLeafColumns().map((column) => {
                                                    if (column.id === "columnActions" || column.id === "title") return null;
                                                    return (
                                                        <li key={column.id} className="mb-2 last-0">
                                                            <div className="form-check fsz-12" onClick={(e) => e.stopPropagation()}>
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    checked={column.getIsVisible()}
                                                                    onChange={(e) => column.getToggleVisibilityHandler()(e)}
                                                                    id={`toggle-${column.id}`}
                                                                />
                                                                <label className="form-check-label ms-2 cursor-pointer fw-500" htmlFor={`toggle-${column.id}`}>
                                                                    {column.columnDef.header || column.id}
                                                                </label>
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </SortableTh>
                                )}
                            </SortableRow>
                        </thead>

                        <tbody>
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumnOrder.length} className="text-center py-4 text-muted fsz-12">
                                        {t("companies.empty")}
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => {
                                    const item = row.original;
                                    return (
                                        <SortableRow key={row.id} items={visibleColumnOrder}>
                                            {visibleColumnOrder.map((colId) => {
                                                const column = table.getColumn(colId);
                                                if (!column || !column.getIsVisible()) return null;

                                                if (colId === "title") {
                                                    return (
                                                        <td className="position-relative ps-5" key={colId} id={colId}>
                                                            <div className="form-check position-absolute top-50 start-0 translate-middle ms-4">
                                                                <input
                                                                    className="form-check-input mt-0 cursor-pointer"
                                                                    type="checkbox"
                                                                    id={`company-${item.id}`}
                                                                    checked={row.getIsSelected()}
                                                                    onChange={row.getToggleSelectedHandler()}
                                                                />
                                                                <label className="form-check-label" htmlFor={`company-${item.id}`}></label>
                                                            </div>
                                                            <div
                                                                className="hover-underline d-flex align-items-center"
                                                                onClick={() => onView?.(item)}
                                                                title={t("common.viewDetails")}
                                                                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                                                            >
                                                                <div className="icon-40 p-1 rounded-circle border me-3 overflow-hidden bg-light d-flex align-items-center justify-content-center">
                                                                    {item.image ? (
                                                                        <img src={resolveImage(item.image)} alt={t("companies.logoAlt", { code: item.code })} className="img-contain h-100 w-100" />
                                                                    ) : (
                                                                        <i className="fas fa-building text-muted"></i>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="fw-500">{text(item.i18nTitle, item.title)}</div>
                                                                    <small className="text-muted fsz-11">{item.code}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "field") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <div className="text-pop fsz-12">
                                                                {item.field?.length > 40 ? `${item.field.slice(0, 40)}...` : item.field}
                                                                <span className="tooltip-text">{item.field}</span>
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "industries") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="fsz-12 text-muted">{
                                                                item.industries_count != null || item.industries_label
                                                                    ? t("companies.industriesCount", { count: item.industries_count ?? (item.industries || []).length })
                                                                    : t("companies.industriesDraft", { count: 0 })
                                                            }</span>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "website") {
                                                    const website = item.website || "";
                                                    if (isPendingWebsite(website)) {
                                                        return (
                                                            <td key={colId} id={colId}>
                                                                <span className="text-muted fsz-12">{website || "-"}</span>
                                                            </td>
                                                        );
                                                    }

                                                    const href = website.startsWith("http") ? website : `https://${website}`;
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-decoration-underline">
                                                                {website}
                                                            </a>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "type") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            {item.type ? statusText(item.type) : "-"}
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

                                                if (colId === "columnActions") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <div className="dropdown">
                                                                <button className="btn bg-transparent border-0 p-0" data-bs-toggle="dropdown">
                                                                    <i className="fas fa-ellipsis fsz-14 text-muted"></i>
                                                                </button>
                                                                <ul className="dropdown-menu shadow-sm border-0 rounded-3">
                                                                    <li>
                                                                        <button className="dropdown-item fsz-12 py-2" onClick={() => onEdit?.(item.id)}>
                                                                            <i className="fal fa-pen me-2 text-muted"></i> {t("common.edit")}
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button className="dropdown-item fsz-12 py-2" onClick={() => onView?.(item)}>
                                                                            <i className="fal fa-eye me-2 text-muted"></i> {t("common.view")}
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button className="dropdown-item text-danger fsz-12 py-2" onClick={() => onDelete?.(item.id)}>
                                                                            <i className="fal fa-trash me-2 text-muted"></i> {t("common.delete")}
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                return (
                                                    <td key={colId} id={colId}>
                                                        {item[column.columnDef.accessorKey] || "-"}
                                                    </td>
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
                        {t("common.pageOf", { page: table.getState().pagination.pageIndex + 1, pages: Math.max(table.getPageCount(), 1) })}
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
