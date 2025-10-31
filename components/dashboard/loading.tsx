import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SectionCardsLoading = () => (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
                <div className="space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </Card>
        ))}
    </div>
);

export const ChartLoading = () => (
    <div className="px-4 lg:px-6">
        <Card className="p-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-[250px] w-full" />
            </div>
        </Card>
    </div>
);

export const DashboardLoading = () => (
    <>
        <SectionCardsLoading />
        <ChartLoading />
    </>
);