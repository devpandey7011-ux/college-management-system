
import api from "@/lib/api";

export type NoticeAudience =
  | "all"
  | "students"
  | "teachers";

export interface NoticeCourse {
  _id: string;
  name: string;
  code: string;
}

export interface NoticeCreator {
  _id: string;
  name: string;
}

export interface AdminNotice {
  _id: string;
  title: string;
  content: string;
  audience: NoticeAudience;
  isPublic: boolean;
  course?: NoticeCourse | null;
  createdBy: NoticeCreator;
  createdAt: string;
  updatedAt: string;
}

interface NoticesResponse {
  notices: AdminNotice[];
}

interface NoticeResponse {
  message: string;
  notice: AdminNotice;
}

export interface CreateNoticeData {
  title: string;
  content: string;
  audience: NoticeAudience;
  course?: string;
  isPublic: boolean;
}

export interface UpdateNoticeData {
  title?: string;
  content?: string;
  audience?: NoticeAudience;
  course?: string | null;
  isPublic?: boolean;
}

export const getAdminNotices = async (): Promise<AdminNotice[]> => {
  const response = await api.get<NoticesResponse>("/notices");

  return response.data.notices;
};

export const createNotice = async (
  data: CreateNoticeData
): Promise<NoticeResponse> => {
  const response = await api.post<NoticeResponse>(
    "/notices",
    data
  );

  return response.data;
};

export const updateNotice = async (
  noticeId: string,
  data: UpdateNoticeData
): Promise<NoticeResponse> => {
  const response = await api.put<NoticeResponse>(
    `/notices/${noticeId}`,
    data
  );

  return response.data;
};

export const deleteNotice = async (
  noticeId: string
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/notices/${noticeId}`
  );

  return response.data;
};
