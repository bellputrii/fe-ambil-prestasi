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
                            className="hover:bg-muted/50 transition-colors"
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
                        <TableCell colSpan={columns.length} className="h-[400px] text-center">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="rounded-full bg-muted p-4">
                                    <svg
                                        className="h-8 w-8 text-muted-foreground"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="max-w-[420px] space-y-2 text-center">
                                    <h3 className="text-lg font-semibold">
                                        {searchValue ? "Tidak ada guru yang ditemukan" : "Belum ada data guru"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {searchValue
                                            ? "Coba ubah kata kunci pencarian Anda"
                                            : "Mulai dengan menambahkan guru pertama ke dalam sistem"}
                                    </p>
                                    {!searchValue && (
                                        <Button
                                            onClick={() => onAddTeacher?.()}
                                            className="mt-4"
                                            variant="outline"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Tambah Guru Pertama
                                        </Button>
                                    )}
                                </div>
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
                header: () => <div className="text-left">Mentor</div>,
                cell: ({ row }) => {
                    const teacher = row.original;
                    return (
                        <div className="flex items-start gap-3 py-4">
                            <Avatar className="h-12 w-12">
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
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{teacher.fullName}</span>
                                    <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${teacher.status === "ACTIVE"
                                            ? "bg-green-50 text-green-700"
                                            : "bg-red-50 text-red-700"
                                        }`}>
                                        {teacher.status === "ACTIVE" ? "Active" : "Inactive"}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {teacher.specialization.split(',').map((skill, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                                        >
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                        {teacher.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                        </svg>
                                        {teacher.phoneNumber}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                id: "courses",
                header: () => <div className="text-center">Total Course</div>,
                cell: ({ row }) => {
                    return (
                        <div className="text-center font-medium">
                            {Math.floor(Math.random() * 10) + 1} {/* Replace with actual data */}
                        </div>
                    );
                },
            },
            {
                id: "actions",
                header: () => <div className="text-right">Aksi</div>,
                cell: ({ row }) => {
                    const teacher = row.original;
                    return (
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewDetail(teacher)}
                                className="h-8 hover:bg-muted"
                            >
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-8"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
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
        <div className="space-y-6">
            <div className="flex flex-col space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{data.length}</p>
                            <p className="text-sm text-muted-foreground">Total Mentor</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
                        <div className="rounded-lg bg-green-100 p-2">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{data.filter((t: Teacher) => t.status === 'ACTIVE').length}</p>
                            <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
                        <div className="rounded-lg bg-red-100 p-2">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{data.filter((t: Teacher) => t.status === 'INACTIVE').length}</p>
                            <p className="text-sm text-muted-foreground">Inactive</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
                        <div className="rounded-lg bg-purple-100 p-2">
                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">1136</p>
                            <p className="text-sm text-muted-foreground">Total Siswa</p>
                        </div>
                    </div>
                </div>

                {/* Search and Actions */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari mentor berdasarkan nama, email, atau keahlian..."
                                value={searchValue}
                                onChange={(event) => onSearchChange?.(event.target.value)}
                                className="pl-9 w-full rounded-full bg-muted/50"
                            />
                        </div>
                    </div>
                    <Button onClick={onAddTeacher} size="default" className="rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Mentor
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div ref={tableContainerRef} className="rounded-xl border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-12 px-6 text-muted-foreground font-medium">
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
                <div className="border-t px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Info Text */}
                        <div className="text-sm text-muted-foreground order-2 sm:order-1">
                            {meta ? (
                                <>
                                    Menampilkan{" "}
                                    <span className="font-medium text-foreground">
                                        {Math.min(
                                            (currentPage - 1) * meta.itemsPerPage + 1,
                                            meta.totalItems
                                        )}
                                        {" - "}
                                        {Math.min(
                                            currentPage * meta.itemsPerPage,
                                            meta.totalItems
                                        )}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-medium text-foreground">
                                        {meta.totalItems}
                                    </span>{" "}
                                    mentor
                                </>
                            ) : (
                                <>
                                    Menampilkan{" "}
                                    <span className="font-medium text-foreground">
                                        {table.getState().pagination.pageIndex *
                                            table.getState().pagination.pageSize +
                                            1}
                                        {" - "}
                                        {Math.min(
                                            (table.getState().pagination.pageIndex + 1) *
                                            table.getState().pagination.pageSize,
                                            data.length
                                        )}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-medium text-foreground">
                                        {data.length}
                                    </span>{" "}
                                    mentor
                                </>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        <Pagination className="order-1 sm:order-2">
                            <PaginationContent className="gap-1">
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={handlePreviousPage}
                                        className={`h-8 min-w-8 w-8 p-0 sm:px-2.5 sm:w-auto rounded-lg ${!canPreviousPage
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer hover:bg-muted"
                                            }`}
                                    >
                                        <span className="sr-only sm:not-sr-only">Sebelumnya</span>
                                    </PaginationPrevious>
                                </PaginationItem>

                                {getPageNumbers().map((page, index) => (
                                    <PaginationItem key={index}>
                                        {page === "..." ? (
                                            <span className="flex h-8 min-w-8 items-center justify-center text-sm">
                                                &hellip;
                                            </span>
                                        ) : (
                                            <PaginationLink
                                                onClick={() => handlePageChange(page as number)}
                                                isActive={currentPage === page}
                                                className="h-8 min-w-8 cursor-pointer hover:bg-muted rounded-lg"
                                            >
                                                {page}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={handleNextPage}
                                        className={`h-8 min-w-8 w-8 p-0 sm:px-2.5 sm:w-auto rounded-lg ${!canNextPage
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer hover:bg-muted"
                                            }`}
                                    >
                                        <span className="sr-only sm:not-sr-only">Selanjutnya</span>
                                    </PaginationNext>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            )}
        </div>
    );
}
