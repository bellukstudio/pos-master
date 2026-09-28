import "server-only";


export const BACKEND_PATHS = {
    login: "/login",
    logout: "/auth/logout",
    me: "/auth/me"
} as const;