import api from "@/lib/api";

export interface SubjectAssignment {
  _id: string;

  teacher: {
    _id: string;
    teacherId: string;
    department: string;
    designation: string;
  };

  subject: {
    _id: string;
    name: string;
    code: string;
    semester: number;
    credits: number;
  };

  course: {
    _id: string;
    name: string;
    code: string;
  };

  createdAt: string;
  updatedAt: string;
}

interface AssignmentsResponse {
  assignments: SubjectAssignment[];
}

interface AssignmentResponse {
  message: string;
  assignment: SubjectAssignment;
}

export interface CreateSubjectAssignmentData {
  teacher: string;
  subject: string;
  course: string;
}

export const getSubjectAssignments =
  async (): Promise<SubjectAssignment[]> => {
    const response =
      await api.get<AssignmentsResponse>(
        "/admin/subject-assignments"
      );

    return response.data.assignments;
  };

export const createSubjectAssignment =
  async (
    data: CreateSubjectAssignmentData
  ): Promise<AssignmentResponse> => {
    const response =
      await api.post<AssignmentResponse>(
        "/admin/subject-assignments",
        data
      );

    return response.data;
  };

export const deleteSubjectAssignment =
  async (
    assignmentId: string
  ): Promise<{ message: string }> => {
    const response =
      await api.delete<{ message: string }>(
        `/admin/subject-assignments/${assignmentId}`
      );

    return response.data;
  };