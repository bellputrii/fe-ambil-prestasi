export interface DashboardData {
    teacherCount: number;
    studentCount: number;
    classCount: number;
    Chart: {
        teacher: {
            oneYear: Record<string, number>;
            fiveYear: Record<string, number>;
        };
        student: {
            oneYear: Record<string, number>;
            fiveYear: Record<string, number>;
        };
    };
}

export interface DashboardApiResponse {
    success: boolean;
    message: string;
    data: DashboardData;
}

export interface ChartDataPoint {
    period: string;
    teacher: number;
    student: number;
}