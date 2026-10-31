import api from "@/lib/api";

export interface AdminCourse {
  _id: string;
  name: string;
  code: string;
  department: string;
  totalSemesters: number;
  createdAt: string;
  updatedAt: string;
}

interface CoursesResponse {
  courses: AdminCourse[];
}

interface CourseResponse {
  message: string;
  course: AdminCourse;
}

export interface CreateCourseData {
  name: string;
  code: string;
  department: string;
  totalSemesters: number;
}

export interface UpdateCourseData {
  name?: string;
  code?: string;
  department?: string;
  totalSemesters?: number;
}

export const getAdminCourses = async (): Promise<AdminCourse[]> => {
  const response = await api.get<CoursesResponse>("/admin/courses");

  return response.data.courses;
};


export const createAdminCourse = async (
  data: CreateCourseData
): Promise<CourseResponse> => {
  const response = await api.post<CourseResponse>(
    "/admin/courses",
    data
  );

  return response.data;
};

export const updateAdminCourse = async (
  courseId: string,
  data: UpdateCourseData
): Promise<CourseResponse> => {
  const response = await api.put<CourseResponse>(
    `/admin/courses/${courseId}`,
    data
  );

  return response.data;
};

export const deleteAdminCourse = async (
  courseId: string
): Promise<{ message: string }> => {
  const response = await api.delete<{
    message: string;
  }>(`/admin/courses/${courseId}`);

  return response.data;
};