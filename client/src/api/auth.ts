import api from "./axios";

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { name: string; email: string; password: string };

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const login = (payload: LoginPayload) =>
  api.post<LoginResponse>("/auth/login", payload);

export const register = (payload: RegisterPayload) =>
  api.post<User>("/auth/register", payload);
