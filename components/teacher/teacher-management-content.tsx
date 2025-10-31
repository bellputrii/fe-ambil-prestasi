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
            {/* Page Header */}
            <div className="px-4 lg:px-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Manajemen Guru
                    </h1>
                    <p className="text-muted-foreground">
                        Kelola data guru dan informasi profil mereka
                        {meta && (
                            <span className="ml-2 text-sm">
                                ({meta.totalItems} total guru)
                            </span>
                        )}
                    </p>
                </div>
            </div>

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
                <ErrorState message={error} onRetry={refetch} />
            )}

            {/* Data Table */}
            {!isLoading && !error && (
                <div className="px-4 lg:px-6">
                    <TeacherTable
                        data={teachers}
                        onViewDetail={handleViewDetail}
                        onAddTeacher={handleOpenAddModal}
                        meta={meta || undefined}
                        onPageChange={handlePageChange}
                        searchValue={searchValue}
                        onSearchChange={handleSearchChange}
                    />
                </div>
            )}

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
