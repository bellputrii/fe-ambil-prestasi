"use client";

import React, { useMemo, useState, useRef } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    ColumnDef,
    flexRender,
    SortingState,
    ColumnFiltersState,
} from "@tanstack/react-table";
import { Teacher } from "@/types/teacher";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, Plus, Search } from "lucide-react";

interface TeacherTableProps {
    data: Teacher[];
    onViewDetail: (teacher: Teacher) => void;
    onAddTeacher: () => void;
    // Server-side pagination props
    meta?: {
        itemCount: number;
        totalItems: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
    onPageChange?: (page: number) => void;
    // Server-side search props
    searchValue?: string;
    onSearchChange?: (search: string) => void;
}

// Komponen terpisah untuk data tabel agar hanya bagian ini yang re-render
const TableData = React.memo(
    ({
        table,
        columns,
        searchValue,
        onAddTeacher,
    }: {
        table: ReturnType<typeof useReactTable<Teacher>>;
        columns: ColumnDef<Teacher>[];
        searchValue?: string;
        onAddTeacher?: () => void;
    }) => {
        return (
            <>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <div className="text-muted-foreground">
                                    {searchValue
                                        ? "Tidak ada guru yang ditemukan"
                                        : "Belum ada data guru"}
                                </div>
                                {!searchValue && (
                                    <button
                                        onClick={() => onAddTeacher?.()}
                                        className="text-blue-500 hover:text-blue-700 underline text-sm transition-colors duration-200"
                                    >
                                        Tambah guru pertama
                                    </button>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </>
        );
    }
);

TableData.displayName = "TableData";

export function TeacherTable({
    data,
    onViewDetail,
    onAddTeacher,
    meta,
    onPageChange,
    searchValue = "",
    onSearchChange,
}: TeacherTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // Memoize data to prevent unnecessary re-renders
    const memoizedData = useMemo(() => data, [data]);

    const columns: ColumnDef<Teacher>[] = useMemo(
        () => [
            {
                accessorKey: "profilePhoto",
                header: () => <div className="text-center">Profil</div>,
                cell: ({ row }) => {
                    const teacher = row.original;
                    return (
                        <div className="flex justify-center">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={teacher.profilePhoto}
                                    alt={teacher.fullName}
                                />
                                <AvatarFallback>
                                    {teacher.fullName
                                        .split(" ")
                                        .slice(0, 2)
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                accessorKey: "fullName",
                header: "Nama Lengkap",
                cell: ({ row }) => {
                    const teacher = row.original;
                    return <span className="font-medium">{teacher.fullName}</span>;
                },
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: ({ row }) => {
                    const email = row.getValue("email") as string;
                    return (
                        <div className="max-w-[200px]">
                            <span className="text-sm text-muted-foreground truncate block">
                                {email}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: "actions",
                header: () => <div className="text-center">Aksi</div>,
                cell: ({ row }) => {
                    const teacher = row.original;
                    return (
                        <div className="flex justify-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewDetail(teacher)}
                                className="h-8 w-8 p-0"
                            >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Lihat detail</span>
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [onViewDetail]
    );

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        // Remove client-side pagination when using server-side
        ...(meta ? {} : { getPaginationRowModel: getPaginationRowModel() }),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: meta?.itemsPerPage || 10,
            },
        },
    });

    // Use server pagination if meta is available, otherwise use client pagination
    const pageCount = meta?.totalPages || table.getPageCount();
    const currentPage =
        meta?.currentPage || table.getState().pagination.pageIndex + 1;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (pageCount <= maxVisiblePages) {
            for (let i = 1; i <= pageCount; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(pageCount);
            } else if (currentPage >= pageCount - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = pageCount - 3; i <= pageCount; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(pageCount);
            }
        }

        return pages;
    };

    // Handle page navigation
    const handlePageChange = (page: number) => {
        if (meta && onPageChange) {
            // Server-side pagination
            onPageChange(page);
        } else {
            // Client-side pagination
            table.setPageIndex(page - 1);
        }
    };

    const handlePreviousPage = () => {
        if (meta && onPageChange) {
            if (currentPage > 1) {
                onPageChange(currentPage - 1);
            }
        } else {
            table.previousPage();
        }
    };

    const handleNextPage = () => {
        if (meta && onPageChange) {
            if (currentPage < pageCount) {
                onPageChange(currentPage + 1);
            }
        } else {
            table.nextPage();
        }
    };

    const canPreviousPage = meta ? currentPage > 1 : table.getCanPreviousPage();
    const canNextPage = meta ? currentPage < pageCount : table.getCanNextPage();

    return (
        <div className="space-y-4">
            {/* Header with Search and Add Button */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari guru..."
                        value={searchValue}
                        onChange={(event) => onSearchChange?.(event.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={onAddTeacher}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Guru
                </Button>
            </div>

            {/* Table */}
            <div ref={tableContainerRef} className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        <TableData
                            table={table}
                            columns={columns}
                            searchValue={searchValue}
                            onAddTeacher={onAddTeacher}
                        />
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
                <div className="flex flex-col items-center gap-4">
                    {/* Info Text */}
                    <div className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                        {meta ? (
                            <>
                                Menampilkan{" "}
                                {Math.min(
                                    (currentPage - 1) * meta.itemsPerPage + 1,
                                    meta.totalItems
                                )}
                                {" - "}
                                {Math.min(
                                    currentPage * meta.itemsPerPage,
                                    meta.totalItems
                                )}{" "}
                                dari {meta.totalItems} guru
                            </>
                        ) : (
                            <>
                                Menampilkan{" "}
                                {table.getState().pagination.pageIndex *
                                    table.getState().pagination.pageSize +
                                    1}
                                {" - "}
                                {Math.min(
                                    (table.getState().pagination.pageIndex + 1) *
                                    table.getState().pagination.pageSize,
                                    data.length
                                )}{" "}
                                dari {data.length} guru
                            </>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    <Pagination>
                        <PaginationContent className="gap-1">
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={handlePreviousPage}
                                    className={
                                        !canPreviousPage
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>

                            {getPageNumbers().map((page, index) => (
                                <PaginationItem key={index}>
                                    {page === "..." ? (
                                        <span className="flex h-9 w-9 items-center justify-center">
                                            ...
                                        </span>
                                    ) : (
                                        <PaginationLink
                                            onClick={() => handlePageChange(page as number)}
                                            isActive={currentPage === page}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={handleNextPage}
                                    className={
                                        !canNextPage
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
