"use client";

import { useState } from "react";
import type { VideoTutorial, VideoTutorialInput } from "@/types/video-tutorial";

interface Props {
  initialData?: VideoTutorial;
  onSubmit: (data: VideoTutorialInput) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

const categories = [
  { value: "invoice", label: "Invoices" },
  { value: "inventory", label: "Inventory" },
  { value: "payment", label: "Payments" },
  { value: "sync", label: "Cloud Sync" },
];

export default function VideoTutorialForm({ initialData, onSubmit, submitLabel = "Save", isLoading = false }: Props) {
  const [form, setForm] = useState<VideoTutorialInput>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    duration: initialData?.duration || "",
    category: initialData?.category || "invoice",
    videoUrl: initialData?.videoUrl || "",
    youtubeId: initialData?.youtubeId || "",
    thumbnailColor: initialData?.thumbnailColor || "#2563eb",
    order: initialData?.order || 0,
    isActive: initialData?.isActive ?? true,
  });

  const handleChange = (field: keyof VideoTutorialInput, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-300">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-300">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          required
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-slate-300">
            Duration 
          </label>
          <input
            id="duration"
            type="text"
            required
            value={form.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-300">
            Category
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium text-slate-300">
          Video URL (YouTube embed or direct)
        </label>
        <input
          id="videoUrl"
          type="url"
          required
          value={form.videoUrl}
          onChange={(e) => handleChange("videoUrl", e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          placeholder="https://www.youtube.com/embed/..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="youtubeId" className="block text-sm font-medium text-slate-300">
            YouTube ID (optional)
          </label>
          <input
            id="youtubeId"
            type="text"
            value={form.youtubeId || ""}
            onChange={(e) => handleChange("youtubeId", e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            placeholder="dQw4w9WgXcQ"
          />
        </div>

        <div>
          <label htmlFor="thumbnailColor" className="block text-sm font-medium text-slate-300">
            Thumbnail Color
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="thumbnailColor"
              type="color"
              value={form.thumbnailColor}
              onChange={(e) => handleChange("thumbnailColor", e.target.value)}
              className="h-10 w-16 rounded border border-slate-700 bg-slate-900 p-1"
            />
            <input
              type="text"
              value={form.thumbnailColor}
              onChange={(e) => handleChange("thumbnailColor", e.target.value)}
              className="block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-slate-300">
            Display Order
          </label>
          <input
            id="order"
            type="number"
            min="0"
            value={form.order}
            onChange={(e) => handleChange("order", parseInt(e.target.value) || 0)}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
            Active
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}