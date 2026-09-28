import { http } from "@/lib/api/http";
import type { AuthUser, LoginPayload, LoginUser } from "./types";

export type * from "./types";


export const login = (payload: LoginPayload) =>
    http.post<{ ok: true; user: LoginUser | null }>("/auth/login", payload);

export const logout = () => http.post<void>("/auth/logout");

export const getMe = () => http.get<AuthUser>("/auth/me");