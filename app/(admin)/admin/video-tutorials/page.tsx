"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { videoTutorialsApi } from "@/lib/video-tutorials-api";
import type { VideoTutorial } from "@/types/video-tutorial";

export default function VideoTutorialsPage() {
  const [videos, setVideos] = useState<VideoTutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = async () => {
    try {
      const res = await videoTutorialsApi.getAll();
      setVideos(res.data.data);
      console.log(res.data.data);
    } catch (err) {
      setError("Failed to load video tutorials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await videoTutorialsApi.delete(id);
      await loadVideos();
    } catch (err) {
      alert("Failed to delete video.");
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-400">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">Video Tutorials</h1>
        <Link
          href="/admin/video-tutorials/new"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          + New Video
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-8 text-center text-slate-400">
          No videos found. Create your first tutorial.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {videos.map((video) => (
                <tr key={video._id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-400">
                    {video.order}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-100">
                    {video.title}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-400">
                    <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
                      {video.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-400">
                    {video.duration}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        video.isActive
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {video.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <Link
                      href={`/admin/video-tutorials/${video._id}/edit`}
                      className="mr-3 text-emerald-400 hover:text-emerald-300"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}