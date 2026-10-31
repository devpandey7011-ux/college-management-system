import api from "@/lib/api";

export type ExamType =
  | "internal"
  | "midterm"
  | "final";

export interface CreateResultData {
  student: string;
  subject: string;
  examType: ExamType;
  marksObtained: number;
  maxMarks: number;
  remarks?: string;
}

export interface Result {
  _id: string;
  student: string;
  subject: {
    _id: string;
    name: string;
    code: string;
    semester: number;
    credits: number;
  };
  teacher: {
    _id: string;
    teacherId: string;
  };
  examType: ExamType;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateResultResponse {
  message: string;
  result: Result;
}

export const createResult = async (
  data: CreateResultData
): Promise<CreateResultResponse> => {
  const response = await api.post<CreateResultResponse>(
    "/results",
    data
  );

  return response.data;
};

export interface UpdateResultData {
  marksObtained?: number;
  maxMarks?: number;
  remarks?: string;
}

interface UpdateResultResponse {
  message: string;
  result: Result;
}

export const updateResult = async (
  id: string,
  data: UpdateResultData
): Promise<UpdateResultResponse> => {
  const response = await api.put<UpdateResultResponse>(
    `/results/${id}`,
    data
  );

  return response.data;
};

interface StudentResultsResponse {
  results: Result[];
}

export const getMyResults = async (): Promise<Result[]> => {
  const response = await api.get<StudentResultsResponse>(
    "/results/my-results"
  );

  return response.data.results;
};