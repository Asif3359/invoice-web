"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VideoTutorialForm from "@/components/admin/VideoTutorialForm";
import { videoTutorialsApi } from "@/lib/video-tutorials-api";
import type { VideoTutorialInput } from "@/types/video-tutorial";

export default function NewVideoTutorialPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: VideoTutorialInput) => {
    setIsLoading(true);
    try {
      await videoTutorialsApi.create(data);
      router.push("/admin/video-tutorials");
    } catch (err) {
      alert("Failed to create video tutorial.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-50">Create Video Tutorial</h1>
      <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-6">
        <VideoTutorialForm onSubmit={handleSubmit} submitLabel="Create" isLoading={isLoading} />
      </div>
    </div>
  );
}