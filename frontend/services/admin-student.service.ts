import api from "@/lib/api";

export interface AdminStudent {
  _id: string;
  createdAt: string;
  updatedAt: string;
  enrollmentNumber: string;
  course: string;
  semester: number;
  phone?: string;
  dateOfBirth?: string;

  userId: {
    _id: string;
    name: string;
    email: string;
    role: "student";
  };
}

interface StudentsResponse {
  students: AdminStudent[];
}

interface StudentResponse {
  message: string;
  student: {
    id: string;
    enrollmentNumber: string;
    name: string;
    email: string;
    course: string;
    semester: number;
    phone?: string;
    dateOfBirth?: string;
  };
}

export interface CreateStudentData {
  name: string;
  email: string;
  password: string;
  enrollmentNumber: string;
  course: string;
  semester: number;
  phone?: string;
  dateOfBirth?: string;
}

export interface UpdateStudentData {
  name?: string;
  email?: string;
  enrollmentNumber?: string;
  course?: string;
  semester?: number;
  phone?: string;
  dateOfBirth?: string;
}

export const getAdminStudents = async (): Promise<
  AdminStudent[]
> => {
  const response = await api.get<StudentsResponse>(
    "/admin/students"
  );

  return response.data.students;
};

export const createAdminStudent = async (
  data: CreateStudentData
): Promise<StudentResponse> => {
  const response = await api.post<StudentResponse>(
    "/admin/students",
    data
  );

  return response.data;
};

export const updateAdminStudent = async (
  studentId: string,
  data: UpdateStudentData
): Promise<StudentResponse> => {
  const response = await api.put<StudentResponse>(
    `/admin/students/${studentId}`,
    data
  );

  return response.data;
};

export const deleteAdminStudent = async (
  studentId: string
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/admin/students/${studentId}`
  );

  return response.data;
};