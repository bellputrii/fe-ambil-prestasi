import { DashboardApiResponse } from "@/types/dashboard";
import { ApiError, handleApiError } from "@/lib/errors";

const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

export async function fetchDashboardData(): Promise<DashboardApiResponse> {
    try {
        // Get token from localStorage (client-side) or cookies (server-side)
        let token: string | null = null;

        if (typeof window !== "undefined") {
            // Client-side: get from localStorage
            token = localStorage.getItem("token");
        } else {
            // Server-side: get from cookies
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            token = cookieStore.get("token")?.value || null;
        }

        if (!token) {
            throw new ApiError("Authentication token not found", 401);
        }

        const response = await fetch(`${BASE_URL}/dashboard`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            // Add cache settings for server components
            next: { revalidate: 300 }, // Revalidate every 5 minutes
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new ApiError("Unauthorized - please login again", 401);
            }
            const errorMessage = `Failed to fetch dashboard data (${response.status})`;
            throw new ApiError(errorMessage, response.status);
        }

        const data = await response.json();

        // Validate response structure
        if (!data || typeof data.success !== "boolean") {
            throw new ApiError("Invalid API response format");
        }

        return data;
    } catch (error) {
        const apiError = handleApiError(error);
        console.error("Error fetching dashboard data:", apiError);
        throw apiError;
    }
}
