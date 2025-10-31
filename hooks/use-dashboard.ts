import { useState, useEffect, useCallback } from "react";
import { DashboardData } from "@/types/dashboard";
import { fetchDashboardData } from "@/lib/api/dashboard";

interface UseDashboardReturn {
    data: DashboardData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetchDashboardData();

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch dashboard data");
            }

            setData(response.data);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error occurred";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    return {
        data,
        isLoading,
        error,
        refetch: loadDashboardData,
    };
}
