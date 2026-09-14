"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import VideoTutorialForm from "@/components/admin/VideoTutorialForm";
import { videoTutorialsApi } from "@/lib/video-tutorials-api";
import type { VideoTutorial, VideoTutorialInput } from "@/types/video-tutorial";

export default function EditVideoTutorialPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoTutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const res = await videoTutorialsApi.getById(id);
        setVideo(res.data.data);
      } catch (err) {
        alert("Video not found.");
        router.push("/admin/video-tutorials");
      } finally {
        setLoading(false);
      }
    };
    loadVideo();
  }, [id, router]);

  const handleSubmit = async (data: VideoTutorialInput) => {
    setIsSaving(true);
    try {
      await videoTutorialsApi.update(id, data);
      router.push("/admin/video-tutorials");
    } catch (err) {
      alert("Failed to update video tutorial.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Loading...</div>;
  }

  if (!video) return null;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-50">Edit Video Tutorial</h1>
      <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-6">
        <VideoTutorialForm initialData={video} onSubmit={handleSubmit} submitLabel="Update" isLoading={isSaving} />
      </div>
    </div>
  );
}