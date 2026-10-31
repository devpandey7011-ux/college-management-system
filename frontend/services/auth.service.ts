import api from "@/lib/api";

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "student" | "teacher" | "admin";
  };
}

export const login = async (
  data: LoginData
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
};

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
}

export const getMe = async (): Promise<CurrentUser> => {
  const response = await api.get<{ user: CurrentUser }>("/auth/me");
  return response.data.user;
};