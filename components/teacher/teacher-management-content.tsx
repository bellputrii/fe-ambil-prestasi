"use client";

import { useState, useCallback } from "react";
import { Teacher } from "@/types/teacher";
import { TeacherTable } from "@/components/teacher-table";
import { TeacherDetailModal } from "@/components/teacher-detail-modal";
import { AddTeacherModal } from "@/components/add-teacher-modal";
import { TeacherTableSkeleton } from "@/components/teacher-table-skeleton";
import { ErrorState } from "@/components/error-state";
import { useTeachers } from "@/hooks/use-teachers";

export function TeacherManagementContent() {
    const {
        teachers,
        meta,
        isLoading,
        error,
        searchValue,
        handlePageChange,
        handleSearchChange,
        refetch,
    } = useTeachers();

    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleViewDetail = useCallback((teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setIsDetailModalOpen(true);
    }, []);

    const handleCloseDetailModal = useCallback(() => {
        setIsDetailModalOpen(false);
        setSelectedTeacher(null);
    }, []);

    const handleUpdateTeacher = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const handleDeleteTeacher = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const handleAddTeacher = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const handleOpenAddModal = useCallback(() => {
        setIsAddModalOpen(true);
    }, []);

    const handleCloseAddModal = useCallback(() => {
        setIsAddModalOpen(false);
    }, []);

    return (
        <>
            <div className="h-full flex flex-col">

                {/* Main Content */}
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Manajemen Mentor</h1>
                            <p className="text-muted-foreground">
                                Kelola data mentor dan informasi profil mereka
                                {meta && (
                                    <span className="ml-2">
                                        ({meta.totalItems} total mentor)
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Loading State */}
                        {isLoading && (
                            <TeacherTableSkeleton
                                searchValue={searchValue}
                                onSearchChange={handleSearchChange}
                                onAddClick={handleOpenAddModal}
                                meta={meta || undefined}
                                onPageChange={handlePageChange}
                            />
                        )}

                        {/* Error State */}
                        {!isLoading && error && (
                            <ErrorState
                                message="Terjadi kesalahan saat memuat data mentor. Silakan coba lagi."
                                onRetry={refetch}
                                title="Gagal Memuat Data"
                            />
                        )}

                        {/* Data Table */}
                        {!isLoading && !error && (
                            <TeacherTable
                                data={teachers}
                                onViewDetail={handleViewDetail}
                                onAddTeacher={handleOpenAddModal}
                                meta={meta || undefined}
                                onPageChange={handlePageChange}
                                searchValue={searchValue}
                                onSearchChange={handleSearchChange}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TeacherDetailModal
                teacher={selectedTeacher}
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                onUpdate={handleUpdateTeacher}
                onDelete={handleDeleteTeacher}
            />

            <AddTeacherModal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                onAdd={handleAddTeacher}
            />
        </>
    );
}
