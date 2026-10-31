import api from "@/lib/api";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late";

export interface CreateAttendanceData {
  student: string;
  subject: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface Attendance {
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
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateAttendanceResponse {
  message: string;
  attendance: Attendance;
}

export const createAttendance = async (
  data: CreateAttendanceData
): Promise<CreateAttendanceResponse> => {
  const response = await api.post<CreateAttendanceResponse>(
    "/attendance",
    data
  );

  return response.data;
};

export interface UpdateAttendanceData {
  status?: AttendanceStatus;
  remarks?: string;
}

interface UpdateAttendanceResponse {
  message: string;
  attendance: Attendance;
}

export const updateAttendance = async (
  id: string,
  data: UpdateAttendanceData
): Promise<UpdateAttendanceResponse> => {
  const response = await api.put<UpdateAttendanceResponse>(
    `/attendance/${id}`,
    data
  );

  return response.data;
};

interface StudentAttendanceResponse {
  attendance: Attendance[];
}

export const getMyAttendance = async (): Promise<Attendance[]> => {
  const response = await api.get<StudentAttendanceResponse>(
    "/attendance/my-attendance"
  );

  return response.data.attendance;
};

export interface AttendanceSummary {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  attendancePercentage: number;
}

interface AttendanceSummaryResponse {
  summary: AttendanceSummary[];
}

export const getMyAttendanceSummary = async (): Promise<
  AttendanceSummary[]
> => {
  const response = await api.get<AttendanceSummaryResponse>(
    "/attendance/my-summary"
  );

  return response.data.summary;
};