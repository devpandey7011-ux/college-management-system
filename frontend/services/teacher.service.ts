import api from "@/lib/api";

export interface TeacherStudent {
  id: string;
  name: string;
  email: string;
  enrollmentNumber: string;
  course: string;
  semester: number;
}

export const getTeacherStudents = async (): Promise<TeacherStudent[]> => {
  const response = await api.get<TeacherStudent[]>(
    "/teachers/students"
  );

  return response.data;
};

export interface TeacherSubjectAssignment {
  _id: string;

  course: {
    _id: string;
    name: string;
    code: string;
  };

  subject: {
    _id: string;
    name: string;
    code: string;
    semester: number;
    credits: number;
  };
}

interface TeacherSubjectAssignmentsResponse {
  assignments: TeacherSubjectAssignment[];
}

export const getTeacherSubjectAssignments = async (): Promise<
  TeacherSubjectAssignment[]
> => {
  const response =
    await api.get<TeacherSubjectAssignmentsResponse>(
      "/teachers/subject-assignments"
    );

  return response.data.assignments;
};

export interface TeacherAssignment {
  _id: string;
  title: string;
  description: string;
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  course: {
    _id: string;
    name: string;
    code: string;
  };
  dueDate: string;
  maxMarks: number;
  createdAt: string;
  updatedAt: string;
}

interface TeacherAssignmentsResponse {
  assignments: TeacherAssignment[];
}

export const getMyTeacherAssignments = async (): Promise<
  TeacherAssignment[]
> => {
  const response = await api.get<TeacherAssignmentsResponse>(
    "/assignments/my-created"
  );

  return response.data.assignments;
};

export interface CreateAssignmentData {
  title: string;
  description: string;
  subject: string;
  course: string;
  dueDate: string;
  maxMarks: number;
}

interface CreateAssignmentResponse {
  message: string;
  assignment: TeacherAssignment;
}

export const createAssignment = async (
  data: CreateAssignmentData
): Promise<CreateAssignmentResponse> => {
  const response = await api.post<CreateAssignmentResponse>(
    "/assignments",
    data
  );

  return response.data;
};

export interface AssignmentSubmissionStudent {
  _id: string;
  enrollmentNumber: string;
  course: string;
  semester: number;
}

export interface TeacherAssignmentSubmission {
  _id: string;

  assignment: {
    _id: string;
    title: string;
    dueDate: string;
    maxMarks: number;
  };

  student: AssignmentSubmissionStudent;

  submissionText?: string;
  fileUrl?: string;

  submittedAt: string;

  status: "submitted" | "late";

  marksObtained?: number;
  feedback?: string;
}

export interface AssignmentSubmissionsResponse {
  assignment: {
    _id: string;
    title: string;
    dueDate: string;
    maxMarks: number;
  };

  submissions: TeacherAssignmentSubmission[];
}

export const getAssignmentSubmissions = async (
  assignmentId: string
): Promise<AssignmentSubmissionsResponse> => {
  const response =
    await api.get<AssignmentSubmissionsResponse>(
      `/assignments/${assignmentId}/submissions`
    );

  return response.data;
};

export interface GradeAssignmentSubmissionData {
  marksObtained: number;
  feedback?: string;
}

interface GradeAssignmentSubmissionResponse {
  message: string;
  submission: TeacherAssignmentSubmission;
}

export const gradeAssignmentSubmission = async (
  submissionId: string,
  data: GradeAssignmentSubmissionData
): Promise<GradeAssignmentSubmissionResponse> => {
  const response =
    await api.put<GradeAssignmentSubmissionResponse>(
      `/assignments/submissions/${submissionId}/grade`,
      data
    );

  return response.data;
};