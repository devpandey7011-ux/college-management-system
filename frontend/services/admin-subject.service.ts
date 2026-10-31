import api from "@/lib/api";

export interface AdminSubject {
  _id: string;
  name: string;
  code: string;
  courseId: {
    _id: string;
    name: string;
    code: string;
  };
  semester: number;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

interface SubjectsResponse {
  subjects: AdminSubject[];
}

interface SubjectResponse {
  message: string;
  subject: AdminSubject;
}

export interface CreateSubjectData {
  name: string;
  code: string;
  courseId: string;
  semester: number;
  credits: number;
}

export interface UpdateSubjectData {
  name?: string;
  code?: string;
  courseId?: string;
  semester?: number;
  credits?: number;
}

export const getAdminSubjects = async (): Promise<AdminSubject[]> => {
  const response = await api.get<SubjectsResponse>("/admin/subjects");

  return response.data.subjects;
};

export const createAdminSubject = async (
  data: CreateSubjectData
): Promise<SubjectResponse> => {
  const response = await api.post<SubjectResponse>(
    "/admin/subjects",
    data
  );

  return response.data;
};

export const updateAdminSubject = async (
  subjectId: string,
  data: UpdateSubjectData
): Promise<SubjectResponse> => {
  const response = await api.put<SubjectResponse>(
    `/admin/subjects/${subjectId}`,
    data
  );

  return response.data;
};

export const deleteAdminSubject = async (
  subjectId: string
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/admin/subjects/${subjectId}`
  );

  return response.data;
};