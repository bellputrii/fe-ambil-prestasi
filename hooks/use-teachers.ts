import { useState, useEffect, useCallback } from "react";
import { Teacher } from "@/types/teacher";
import { fetchTeachers, deleteTeacher } from "@/lib/api/teachers";
import { toast } from "sonner";

interface TeacherMeta {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

interface UseTeachersReturn {
    teachers: Teacher[];
    meta: TeacherMeta | null;
    isLoading: boolean;
    error: string | null;
    currentPage: number;
    searchValue: string;
    debouncedSearch: string;
    isDeletingTeacher: boolean;
    setCurrentPage: (page: number) => void;
    setSearchValue: (search: string) => void;
    handlePageChange: (page: number) => void;
    handleSearchChange: (search: string) => void;
    loadTeachers: () => Promise<void>;
    handleDeleteTeacher: (id: string) => Promise<void>;
    refetch: () => Promise<void>;
}

export function useTeachers(): UseTeachersReturn {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [meta, setMeta] = useState<TeacherMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeletingTeacher, setIsDeletingTeacher] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search value
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 600);

        return () => clearTimeout(timer);
    }, [searchValue]);

    // Load teachers whenever page or search changes
    const loadTeachers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await fetchTeachers(currentPage, debouncedSearch);

            setTeachers(result.teachers);
            setMeta(result.meta);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal memuat data guru";
            setError(errorMessage);
            toast.error("Gagal memuat data guru");
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        loadTeachers();
    }, [loadTeachers]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleSearchChange = useCallback((search: string) => {
        setSearchValue(search);
        setCurrentPage(1); // Reset to first page on search
    }, []);

    const handleDeleteTeacher = useCallback(async (id: string) => {
        setIsDeletingTeacher(true);
        try {
            await deleteTeacher(id);
            toast.success("Guru berhasil dihapus");
            await loadTeachers();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menghapus guru";
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsDeletingTeacher(false);
        }
    }, [loadTeachers]);

    const refetch = useCallback(async () => {
        await loadTeachers();
    }, [loadTeachers]);

    return {
        teachers,
        meta,
        isLoading,
        error,
        currentPage,
        searchValue,
        debouncedSearch,
        isDeletingTeacher,
        setCurrentPage,
        setSearchValue,
        handlePageChange,
        handleSearchChange,
        loadTeachers,
        handleDeleteTeacher,
        refetch,
    };
}
