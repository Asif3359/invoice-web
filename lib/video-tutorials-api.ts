// lib/video-tutorials-api.ts
import { api } from "./api-client";
import type { VideoTutorial, VideoTutorialInput } from "@/types/video-tutorial";

export const videoTutorialsApi = {
  getAll: () => api.get<{ success: boolean; data: VideoTutorial[] }>("/video-tutorials"),
  getById: (id: string) => api.get<{ success: boolean; data: VideoTutorial }>(`/video-tutorials/${id}`),
  create: (data: VideoTutorialInput) => api.post<{ success: boolean; data: VideoTutorial }>("/video-tutorials", data),
  update: (id: string, data: Partial<VideoTutorialInput>) =>
    api.put<{ success: boolean; data: VideoTutorial }>(`/video-tutorials/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/video-tutorials/${id}`),
};