"use client";

import { useMemo, useState, useEffect } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import ProjectsFilter from "./ProjectsFilter";
import SortableTh from "../../shared/table/SortableTh";
import SortableRow from "../../shared/table/SortableRow";
import { publicPath } from "@/utils/publicPath";
import { useCompanies } from "@/hooks/useCompanies";
import { useIndustries } from "@/hooks/useIndustries";
import { buildCompanyFilterOptions } from "@/lib/companyOptions";
import { buildIndustryFilterOptions } from "@/lib/industryOptions";

export default function ProjectsTable({
    data = [],
    companiesByCode = {},
    selectedIds = [],
    onSelectionChange,
    onEdit,
    onDelete,
    onView,
}) {
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const [columnVisibility, setColumnVisibility] = useState({});
    const [search, setSearch] = useState("");
    const [companyFilter, setCompanyFilter] = useState("");
    const [industryFilter, setIndustryFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [featuredFilter, setFeaturedFilter] = useState("");
    const { data: companies = [] } = useCompanies();
    const { data: industries = [] } = useIndustries();

    const companyOptions = useMemo(
        () => buildCompanyFilterOptions(companies),
        [companies]
    );

    const industryOptions = useMemo(
        () => buildIndustryFilterOptions(industries),
        [industries]
    );

    const yearOptions = useMemo(() => {
        const years = [...new Set(data.map((item) => String(item.year)).filter(Boolean))]
            .sort((a, b) => Number(b) - Number(a));
        return years.map((year) => ({ value: year, label: year }));
    }, [data]);

    const filteredData = useMemo(() => {
        const q = search.trim().toLowerCase();
        return data.filter((item) => {
            const matchesSearch =
                !q ||
                String(item.title || "").toLowerCase().includes(q) ||
                String(item.client || "").toLowerCase().includes(q);
            const matchesCompany = !companyFilter || item.company_code === companyFilter;
            const matchesIndustry = !industryFilter || item.industry === industryFilter;
            const matchesYear = !yearFilter || String(item.year) === String(yearFilter);
            const matchesFeatured =
                !featuredFilter ||
                (featuredFilter === "yes" ? Boolean(item.featured) : !item.featured);
            return matchesSearch && matchesCompany && matchesIndustry && matchesYear && matchesFeatured;
        });
    }, [data, search, companyFilter, industryFilter, yearFilter, featuredFilter]);

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
            header: "Project",
            enableSorting: true,
        },
        {
            id: "client",
            accessorKey: "client",
            header: "Client",
            enableSorting: true,
        },
        {
            id: "company",
            accessorKey: "company_code",
            header: "Company",
            enableSorting: true,
        },
        {
            id: "industry",
            accessorKey: "industry",
            header: "Industry",
            enableSorting: true,
        },
        {
            id: "year",
            accessorKey: "year",
            header: "Year",
            enableSorting: true,
        },
        {
            id: "featured",
            accessorKey: "featured",
            header: "Featured",
            enableSorting: true,
        },
        {
            id: "status",
            accessorKey: "status",
            header: "Status",
            enableSorting: true,
        },
        {
            id: "columnActions",
            header: "Actions",
            enableSorting: false,
        },
    ], []);

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
        setCompanyFilter("");
        setIndustryFilter("");
        setYearFilter("");
        setFeaturedFilter("");
        setSorting([]);
    };

    const visibleColumnOrder = useMemo(() => {
        return columnOrder.filter((id) => table.getColumn(id)?.getIsVisible());
    }, [columnOrder, columnVisibility, table]);

    const filteredCount = filteredData.length;

    return (
        <>
            <ProjectsFilter
                search={search}
                onSearchChange={setSearch}
                companyFilter={companyFilter}
                onCompanyChange={setCompanyFilter}
                industryFilter={industryFilter}
                onIndustryChange={setIndustryFilter}
                yearFilter={yearFilter}
                onYearChange={setYearFilter}
                featuredFilter={featuredFilter}
                onFeaturedChange={setFeaturedFilter}
                companyOptions={companyOptions}
                industryOptions={industryOptions}
                yearOptions={yearOptions}
                onReset={resetAllFilters}
            />

            <div className="table-content">
                <div className="table-responsive position-relative">
                    <table className="table align-middle">
                        <thead>
                            <SortableRow items={visibleColumnOrder}>
                                {table.getColumn("title")?.getIsVisible() && (
                                    <SortableTh id="title" key="title" className="position-relative ps-5" disabled>
                                        <div className="form-check position-absolute top-50 start-0 translate-middle ms-4">
                                            <input
                                                className="form-check-input mt-0 cursor-pointer"
                                                id="select-all-projects"
                                                type="checkbox"
                                                checked={table.getIsAllPageRowsSelected()}
                                                onChange={table.getToggleAllPageRowsSelectedHandler()}
                                            />
                                            <label className="form-check-label" htmlFor="select-all-projects"></label>
                                        </div>
                                        <span>Project</span>
                                        <div className="dropdown ms-auto" onClick={(e) => e.stopPropagation()}>
                                            <button className="btn bg-transparent border-0 p-0" data-bs-toggle="dropdown">
                                                <i className="fat fa-sort fsz-12"></i>
                                            </button>
                                            <ul className="dropdown-menu shadow-sm border-0 rounded-3">
                                                <li className="dropdown-item cursor-pointer fsz-12 py-2" onClick={() => table.getColumn("title").toggleSorting(false)}>
                                                    <i className="fal fa-sort-alpha-up me-2 text-muted"></i> (A → Z)
                                                </li>
                                                <li className="dropdown-item cursor-pointer fsz-12 py-2" onClick={() => table.getColumn("title").toggleSorting(true)}>
                                                    <i className="fal fa-sort-alpha-down me-2 text-muted"></i> (Z → A)
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

                                {table.getColumn("columnActions")?.getIsVisible() && (
                                    <SortableTh id="columnActions" key="columnActions" disabled>
                                        <div className="dropdown icon-30 ms-auto">
                                            <button className="btn bg-white border-0 p-0 icon-30" data-bs-toggle="dropdown" type="button" data-bs-auto-close="outside">
                                                <i className="fas fa-ellipsis-v fsz-12"></i>
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 p-3" onClick={(e) => e.stopPropagation()}>
                                                <h6 className="fsz-11 text-uppercase fw-600 text-muted mb-3 border-bottom pb-2">Toggle Columns</h6>
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
                                                                    id={`toggle-project-${column.id}`}
                                                                />
                                                                <label className="form-check-label ms-2 cursor-pointer fw-500" htmlFor={`toggle-project-${column.id}`}>
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
                                        No projects found
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => {
                                    const item = row.original;
                                    const company = companiesByCode[item.company_code];

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
                                                                    id={`project-${item.id}`}
                                                                    checked={row.getIsSelected()}
                                                                    onChange={row.getToggleSelectedHandler()}
                                                                />
                                                                <label className="form-check-label" htmlFor={`project-${item.id}`}></label>
                                                            </div>
                                                            <div
                                                                className="hover-underline"
                                                                onClick={() => onView?.(item)}
                                                                title="View Details"
                                                                style={{ cursor: "pointer" }}
                                                            >
                                                                <div className="fw-500 fsz-13">{item.title}</div>
                                                                {(item.content_label || item.is_sample) && (
                                                                    <small className="text-muted fsz-11">
                                                                        {item.content_label || "Sample"}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "company") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="icon-30 p-1 rounded-circle border overflow-hidden bg-light d-flex align-items-center justify-content-center">
                                                                    {company?.image ? (
                                                                        <img
                                                                            src={publicPath(company.image)}
                                                                            alt={`${item.company_code} logo`}
                                                                            className="img-contain h-100 w-100"
                                                                        />
                                                                    ) : (
                                                                        <i className="fal fa-building text-muted fsz-11"></i>
                                                                    )}
                                                                </div>
                                                                <span className="fsz-12">{item.company_code || "-"}</span>
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "featured") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            {item.featured ? (
                                                                <span className="badge bg-warning-subtle text-dark border fsz-11">Featured</span>
                                                            ) : (
                                                                <span className="text-muted fsz-12">—</span>
                                                            )}
                                                        </td>
                                                    );
                                                }

                                                if (colId === "status") {
                                                    return (
                                                        <td key={colId} id={colId}>
                                                            <span className="badge bg-light text-dark border fsz-11">
                                                                {item.status || "Draft"}
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
                                                                            <i className="fal fa-pen me-2 text-muted"></i> Edit
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button className="dropdown-item fsz-12 py-2" onClick={() => onView?.(item)}>
                                                                            <i className="fal fa-eye me-2 text-muted"></i> View
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button className="dropdown-item text-danger fsz-12 py-2" onClick={() => onDelete?.(item.id)}>
                                                                            <i className="fal fa-trash me-2 text-muted"></i> Delete
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
