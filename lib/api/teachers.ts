import {
    Teacher,
    TeachersApiResponse,
    ApiTeacher,
    CreateTeacherRequest,
    CreateTeacherResponse,
    DeleteTeacherResponse,
    UpdateTeacherRequest,
    UpdateTeacherResponse,
} from "@/types/teacher";
import { ApiError, handleApiError } from "@/lib/errors";

const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

// Helper to get auth token
async function getToken(): Promise<string | null> {
    if (typeof window !== "undefined") {
        // Client-side: get from localStorage
        return localStorage.getItem("token");
    } else {
        // Server-side: get from cookies
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        return cookieStore.get("token")?.value || null;
    }
}

function transformApiTeacher(apiTeacher: ApiTeacher): Teacher {
    return {
        id: apiTeacher.id,
        profilePhoto: apiTeacher.profileImage,
        fullName: apiTeacher.name,
        username: apiTeacher.username,
        email: apiTeacher.email,
        phoneNumber: apiTeacher.telp,
        address: "", // Not available in API response
        dateOfBirth: "", // Not available in API response
        subjects: [apiTeacher.specialization], // Convert specialization to subjects array
        joinDate: "", // Not available in API response
        status: apiTeacher.status,
        bio: apiTeacher.bio,
        specialization: apiTeacher.specialization,
    };
}

export async function fetchTeachers(
    page: number = 1,
    search?: string
): Promise<{
    teachers: Teacher[];
    meta: TeachersApiResponse["meta"];
}> {
    try {
        const token = await getToken();

        if (!token) {
            throw new ApiError("Authentication token not found", 401);
        }

        // Build query parameters
        const params = new URLSearchParams({
            page: page.toString(),
        });

        if (search && search.trim()) {
            params.append("search", search.trim());
        }

        const response = await fetch(`${BASE_URL}/teachers?${params.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorMessage = `Failed to fetch teachers (${response.status})`;
            throw new ApiError(errorMessage, response.status);
        }

        const data: TeachersApiResponse = await response.json();

        // Validate response structure
        if (
            !data ||
            typeof data.success !== "boolean" ||
            !Array.isArray(data.data)
        ) {
            throw new ApiError("Invalid API response format");
        }

        if (!data.success) {
            throw new ApiError(data.message || "API request failed");
        }

        return {
            teachers: data.data.map(transformApiTeacher),
            meta: data.meta,
        };
    } catch (error) {
        const apiError = handleApiError(error);
        console.error("Error fetching teachers:", {
            message: apiError.message,
            status: apiError.status,
            baseUrl: BASE_URL,
            page,
            search,
        });
        throw apiError;
    }
}

export async function createTeacher(
    teacherData: Omit<CreateTeacherRequest, "password" | "passwordConfirmation">
): Promise<Teacher> {
    // Use username as default password for new teachers
    const defaultPassword = teacherData.username;

    const requestData: CreateTeacherRequest = {
        ...teacherData,
        password: defaultPassword,
        passwordConfirmation: defaultPassword,
    };

    try {
        const token = await getToken();

        if (!token) {
            throw new ApiError("Authentication token not found", 401);
        }

        const response = await fetch(`${BASE_URL}/teachers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestData),
        });

        const data: CreateTeacherResponse = await response.json();

        // Check if request failed
        if (!response.ok || !data.success) {
            // Handle validation errors
            if (data.errors) {
                const error = new ApiError(
                    data.message || "Validation failed",
                    response.status
                );
                // Attach validation errors to the error object
                (
                    error as ApiError & { validationErrors: Record<string, string[]> }
                ).validationErrors = data.errors;
                throw error;
            }
            throw new ApiError(
                data.message || `Failed to create teacher (${response.status})`,
                response.status
            );
        }

        // Validate response structure
        if (!data.data) {
            throw new ApiError("Invalid API response format");
        }

        return transformApiTeacher(data.data);
    } catch (error) {
        const apiError = handleApiError(error);
        console.error("Error creating teacher:", {
            message: apiError.message,
            status: apiError.status,
            baseUrl: BASE_URL,
        });
        throw apiError;
    }
}

export async function deleteTeacher(teacherId: string): Promise<void> {
    try {
        const token = await getToken();

        if (!token) {
            throw new ApiError("Authentication token not found", 401);
        }

        const response = await fetch(`${BASE_URL}/teachers/${teacherId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorMessage = `Failed to delete teacher (${response.status})`;
            throw new ApiError(errorMessage, response.status);
        }

        const data: DeleteTeacherResponse = await response.json();

        // Validate response structure
        if (!data || typeof data.success !== "boolean") {
            throw new ApiError("Invalid API response format");
        }

        if (!data.success) {
            throw new ApiError(data.message || "API request failed");
        }
    } catch (error) {
        const apiError = handleApiError(error);
        console.error("Error deleting teacher:", {
            message: apiError.message,
            status: apiError.status,
            baseUrl: BASE_URL,
            teacherId,
        });
        throw apiError;
    }
}

export async function updateTeacher(
    teacherId: string,
    teacherData: UpdateTeacherRequest
): Promise<Teacher> {
    try {
        const token = await getToken();

        if (!token) {
            throw new ApiError("Authentication token not found", 401);
        }

        const response = await fetch(`${BASE_URL}/teachers/${teacherId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(teacherData),
        });

        const data: UpdateTeacherResponse = await response.json();

        // Check if request failed
        if (!response.ok || !data.success) {
            // Handle validation errors
            if (data.errors) {
                const error = new ApiError(
                    data.message || "Validation failed",
                    response.status
                );
                // Attach validation errors to the error object
                (
                    error as ApiError & { validationErrors: Record<string, string[]> }
                ).validationErrors = data.errors;
                throw error;
            }
            throw new ApiError(
                data.message || `Failed to update teacher (${response.status})`,
                response.status
            );
        }

        // Validate response structure
        if (!data.data) {
            throw new ApiError("Invalid API response format");
        }

        return transformApiTeacher(data.data);
    } catch (error) {
        const apiError = handleApiError(error);
        console.error("Error updating teacher:", {
            message: apiError.message,
            status: apiError.status,
            baseUrl: BASE_URL,
            teacherId,
        });
        throw apiError;
    }
}
