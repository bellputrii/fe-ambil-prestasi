"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { DashboardLoading } from "@/components/dashboard/loading";
import { ErrorState } from "@/components/error-state";
import { useDashboard } from "@/hooks/use-dashboard";

export function DashboardContent() {
    const { data, isLoading, error, refetch } = useDashboard();

    if (isLoading) {
        return <DashboardLoading />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={refetch} />;
    }

    if (!data) {
        return <ErrorState message="No data available" onRetry={refetch} />;
    }

    return (
        <>
            <SectionCards data={data} />
            <div className="px-4 lg:px-6">
                <ChartAreaInteractive data={data} />
            </div>
        </>
    );
}