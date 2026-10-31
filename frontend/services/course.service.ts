import api from "@/lib/api";

export interface Course {
  _id: string;
  name: string;
  code: string;
  department: string;
  duration?: number;
  totalSemesters: number;
}

interface CoursesResponse {
  courses: Course[];
}

export const getCourses = async (): Promise<Course[]> => {
  const response = await api.get<CoursesResponse>("/courses");

  return response.data.courses;
};