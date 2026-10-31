
import api from "@/lib/api";

export interface NoticeCourse {
  _id: string;
  name: string;
  code: string;
}

export interface NoticeCreator {
  _id: string;
  name: string;
}

export type NoticeAudience = "all" | "students" | "teachers";

export interface Notice {
  _id: string;
  title: string;
  content: string;
  audience: NoticeAudience;
  isPublic?: boolean;
  course?: NoticeCourse | null;
  createdBy?: NoticeCreator;
  createdAt: string;
  updatedAt: string;
}

interface GetNoticesResponse {
  notices: Notice[];
}

export const getNotices = async (): Promise<Notice[]> => {
  const response = await api.get<GetNoticesResponse>("/notices");

  return response.data.notices;
};

export const getPublicNotices = async (): Promise<Notice[]> => {
  const response = await api.get<GetNoticesResponse>("/notices/public");

  return response.data.notices;
};
