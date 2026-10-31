import api from "@/lib/api";

export interface AssignmentSubject {
  _id: string;
  name: string;
  code: string;
  semester: number;
  credits: number;
}

export interface AssignmentCourse {
  _id: string;
  name: string;
  code: string;
}

export interface AssignmentTeacher {
  _id: string;
  teacherId: string;
  department?: string;
  designation?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: AssignmentSubject;
  course: AssignmentCourse;
  teacher: AssignmentTeacher;
  dueDate: string;
  maxMarks: number;
  createdAt: string;
  updatedAt: string;
}

interface MyAssignmentsResponse {
  assignments: Assignment[];
}

export const getMyAssignments = async (): Promise<
  Assignment[]
> => {
  const response =
    await api.get<MyAssignmentsResponse>(
      "/assignments/my-assignments"
    );

  return response.data.assignments;
};

export interface SubmitAssignmentData {
  submissionText?: string;
  fileUrl?: string;
}

export interface AssignmentSubmission {
  _id: string;
  assignment: {
    _id: string;
    title: string;
    dueDate: string;
    maxMarks: number;
  };
  student: {
    enrollmentNumber: string;
    course: string;
    semester: number;
  };
  submissionText?: string;
  fileUrl?: string;
  submittedAt: string;
  status: "submitted" | "late";
  marksObtained?: number;
  feedback?: string;
}

interface SubmitAssignmentResponse {
  message: string;
  submission: AssignmentSubmission;
}

export const submitAssignment = async (
  assignmentId: string,
  data: SubmitAssignmentData
): Promise<SubmitAssignmentResponse> => {
  const response =
    await api.post<SubmitAssignmentResponse>(
      `/assignments/${assignmentId}/submit`,
      data
    );

  return response.data;
};

interface MySubmissionResponse {
  submission: AssignmentSubmission;
}

export const getMySubmission = async (
  assignmentId: string
): Promise<AssignmentSubmission> => {
  const response =
    await api.get<MySubmissionResponse>(
      `/assignments/${assignmentId}/my-submission`
    );

  return response.data.submission;
};