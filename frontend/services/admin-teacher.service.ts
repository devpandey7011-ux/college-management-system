import api from "@/lib/api";

export interface AdminTeacher {
  _id: string;
  createdAt: string;
  updatedAt: string;

  teacherId: string;
  department: string;
  designation: string;
  phone?: string;

  user: {
    _id: string;
    name: string;
    email: string;
    role: "teacher";
  };
}

interface TeachersResponse {
  teachers: AdminTeacher[];
}

interface TeacherResponse {
  message: string;
  teacher: {
    id: string;
    teacherId: string;
    name: string;
    email: string;
    department: string;
    designation: string;
    phone?: string;
  };
}

export interface CreateTeacherData {
  name: string;
  email: string;
  password: string;
  teacherId: string;
  department: string;
  designation: string;
  phone?: string;
}

export interface UpdateTeacherData {
  name?: string;
  email?: string;
  teacherId?: string;
  department?: string;
  designation?: string;
  phone?: string;
}

export const getAdminTeachers = async (): Promise<
  AdminTeacher[]
> => {
  const response =
    await api.get<TeachersResponse>(
      "/admin/teachers"
    );

  return response.data.teachers;
};

export const createAdminTeacher = async (
  data: CreateTeacherData
): Promise<TeacherResponse> => {
  const response =
    await api.post<TeacherResponse>(
      "/admin/teachers",
      data
    );

  return response.data;
};

export const updateAdminTeacher = async (
  teacherId: string,
  data: UpdateTeacherData
): Promise<TeacherResponse> => {
  const response =
    await api.put<TeacherResponse>(
      `/admin/teachers/${teacherId}`,
      data
    );

  return response.data;
};

export const deleteAdminTeacher = async (
  teacherId: string
): Promise<{ message: string }> => {
  const response =
    await api.delete<{ message: string }>(
      `/admin/teachers/${teacherId}`
    );

  return response.data;
};