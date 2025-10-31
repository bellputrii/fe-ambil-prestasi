import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Search } from "lucide-react";

interface TeacherTableSkeletonProps {
    searchValue: string;
    onSearchChange: (search: string) => void;
    onAddClick: () => void;
    meta?: {
        itemCount: number;
        totalItems: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
    onPageChange?: (page: number) => void;
}

export function TeacherTableSkeleton({
    searchValue,
    onSearchChange,
    onAddClick,
    meta,
    onPageChange,
}: TeacherTableSkeletonProps) {
    return (
        <div className="px-4 lg:px-6">
            <div className="space-y-4">
                {/* Search dan Add Button tetap ditampilkan */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari guru..."
                            value={searchValue}
                            onChange={(event) => onSearchChange(event.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button onClick={onAddClick}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Guru
                    </Button>
                </div>

                {/* Table dengan skeleton hanya di bagian data */}
                <div className="rounded-md border">
                    <Table>
                        {/* Header tetap ditampilkan */}
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">Profile</TableHead>
                                <TableHead>Nama Lengkap</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Hanya skeleton rows */}
                            {Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-48" />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            <Skeleton className="h-8 w-8 rounded" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination tetap ditampilkan jika ada meta */}
                {meta && meta.totalPages > 1 && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-sm text-muted-foreground text-center">
                            Menampilkan{" "}
                            {Math.min(
                                (meta.currentPage - 1) * meta.itemsPerPage + 1,
                                meta.totalItems
                            )}
                            {" - "}
                            {Math.min(
                                meta.currentPage * meta.itemsPerPage,
                                meta.totalItems
                            )}{" "}
                            dari {meta.totalItems} guru
                        </div>
                        <Pagination>
                            <PaginationContent className="gap-1">
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            onPageChange?.(Math.max(1, meta.currentPage - 1))
                                        }
                                        className={
                                            meta.currentPage <= 1
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink isActive>{meta.currentPage}</PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() =>
                                            onPageChange?.(
                                                Math.min(meta.totalPages, meta.currentPage + 1)
                                            )
                                        }
                                        className={
                                            meta.currentPage >= meta.totalPages
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
        </div>
    );
}
