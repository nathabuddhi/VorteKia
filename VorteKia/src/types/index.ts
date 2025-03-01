export interface ApiResponse<T> {
    success: true | false;
    data: T | null;
    message: string | null;
}

export interface User {
    user_id: string;
    email: string;
    password: string;
    name: string;
}

export interface UserLoggedIn {
    user_id: string;
    role: string;
    division: string;
}
