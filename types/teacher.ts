export interface Teacher {
    id: string;
    profilePhoto: string;
    fullName: string;
    username: string;
    email: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: string;
    subjects: string[];
    joinDate: string;
    status: "ACTIVE" | "INACTIVE";
    bio: string;
    specialization: string;
}

// API Response Types
export interface ApiTeacher {
    id: string;
    email: string;
    username: string;
    name: string;
    profileImage: string;
    roleId: number;
    telp: string;
    status: "ACTIVE" | "INACTIVE";
    specialization: string;
    bio: string;
}

export interface TeachersApiResponse {
    success: boolean;
    message: string;
    data: ApiTeacher[];
    meta: {
        itemCount: number;
        totalItems: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}

export interface CreateTeacherRequest {
    name: string;
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    telp: string;
    status: "ACTIVE" | "INACTIVE";
    specialization: string;
    bio: string;
}

export interface CreateTeacherResponse {
    success: boolean;
    message: string;
    data: ApiTeacher | null;
    errors?: {
        [key: string]: string[];
    };
}

export interface DeleteTeacherResponse {
    success: boolean;
    message: string;
    data: null;
}

export interface UpdateTeacherRequest {
    name?: string;
    username?: string;
    email?: string;
    telp?: string;
    status?: "ACTIVE" | "INACTIVE";
    specialization?: string;
    bio?: string;
}

export interface UpdateTeacherResponse {
    success: boolean;
    message: string;
    data: ApiTeacher | null;
    errors?: {
        [key: string]: string[];
    };
}
