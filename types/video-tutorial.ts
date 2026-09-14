// types/video-tutorial.ts
export type VideoCategory = "invoice" | "inventory" | "payment" | "sync";

export interface VideoTutorial {
  _id: string;
  title: string;
  description: string;
  duration: string;
  category: VideoCategory;
  videoUrl: string;
  youtubeId?: string;
  thumbnailColor: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VideoTutorialInput = Omit<VideoTutorial, "_id" | "createdAt" | "updatedAt">;