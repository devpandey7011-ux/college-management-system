import api from "@/lib/api";

export interface Subject {
  _id: string;
  name: string;
  code: string;
  courseId?: string;
  semester: number;
  credits: number;
}

interface SubjectsResponse {
  subjects: Subject[];
}

export const getSubjects = async (): Promise<Subject[]> => {
  const response = await api.get<SubjectsResponse>("/subjects");

  return response.data.subjects;
};