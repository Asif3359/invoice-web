"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/admin/ErrorState";
import { Loading } from "@/components/admin/Loading";
import { StatusAlert, SubscriptionStatusBadge } from "@/components/status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, nativeControlClass } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

type TutorialCategory = "invoice" | "inventory" | "payment" | "sync";

const categories: { value: TutorialCategory; label: string }[] = [
  { value: "invoice", label: "Invoices" },
  { value: "inventory", label: "Inventory" },
  { value: "payment", label: "Payments" },
  { value: "sync", label: "Cloud sync" },
];

interface VideoTutorialRow {
  _id: string;
  title: string;
  description: string;
  duration: string;
  category: TutorialCategory;
  videoUrl: string;
  youtubeId?: string | null;
  thumbnailColor: string;
  order: number;
  isActive: boolean;
  updatedAt?: string;
}

type VideosResponse = {
  success: boolean;
  data?: VideoTutorialRow[];
};

type ApiErrorData = {
  message?: string;
  errors?: { msg?: string }[];
};

type VideoForm = {
  title: string;
  description: string;
  duration: string;
  category: TutorialCategory;
  videoUrl: string;
  thumbnailColor: string;
  order: string;
  isActive: boolean;
};

const emptyForm: VideoForm = {
  title: "",
  description: "",
  duration: "",
  category: "invoice",
  videoUrl: "",
  thumbnailColor: "#2563eb",
  order: "0",
  isActive: true,
};

/** Mirrors utils/videoSource.js so the preview matches what gets stored. */
function previewVideoId(value: string): string | null {
  const trimmed = value.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);
  if (host === "youtu.be") return segments[0] ?? null;
  if (!host.endsWith("youtube.com")) return null;

  const watchId = url.searchParams.get("v");
  if (watchId) return watchId;

  const marker = segments.findIndex((part) =>
    ["embed", "shorts", "live", "v"].includes(part),
  );
  const id = marker === -1 ? null : (segments[marker + 1] ?? null);
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

export default function VideoTutorialsPage() {
  const [videos, setVideos] = useState<VideoTutorialRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VideoForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get<VideosResponse>("/admin/video-tutorials", {
        params: { isActive: "all" },
      });
      setVideos(res.data.data ?? []);
    } catch {
      setError("Unable to load video tutorials from /admin/video-tutorials.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setField<K extends keyof VideoForm>(key: K, value: VideoForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
    setOpen(true);
  }

  function openEdit(row: VideoTutorialRow) {
    setForm({
      title: row.title,
      description: row.description,
      duration: row.duration,
      category: row.category,
      videoUrl: row.videoUrl,
      thumbnailColor: row.thumbnailColor ?? "#2563eb",
      order: String(row.order ?? 0),
      isActive: row.isActive,
    });
    setEditingId(row._id);
    setFormError(null);
    setOpen(true);
  }

  function errorMessage(err: unknown, fallback: string) {
    const data = axios.isAxiosError(err)
      ? (err.response?.data as ApiErrorData | undefined)
      : undefined;
    return data?.errors?.[0]?.msg ?? data?.message ?? fallback;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      duration: form.duration.trim(),
      category: form.category,
      videoUrl: form.videoUrl.trim(),
      thumbnailColor: form.thumbnailColor,
      order: Number(form.order || 0),
      isActive: form.isActive,
    };

    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/admin/video-tutorials/${editingId}`, payload);
      } else {
        await api.post("/admin/video-tutorials", payload);
      }
      setOpen(false);
      toast.success(
        editingId ? "Video tutorial updated." : "Video tutorial created.",
      );
      await load();
    } catch (err) {
      setFormError(errorMessage(err, "Could not save the video tutorial."));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(row: VideoTutorialRow) {
    try {
      await api.put(`/admin/video-tutorials/${row._id}`, {
        isActive: !row.isActive,
      });
      toast.success(
        row.isActive
          ? `“${row.title}” is now hidden from the app.`
          : `“${row.title}” is now visible in the app.`,
      );
      await load();
    } catch (err) {
      toast.error(errorMessage(err, "Could not update the tutorial."));
    }
  }

  async function handleDelete(row: VideoTutorialRow) {
    if (!window.confirm(`Delete “${row.title}”? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/video-tutorials/${row._id}`);
      toast.success("Video tutorial deleted.");
      await load();
    } catch (err) {
      toast.error(errorMessage(err, "Could not delete the tutorial."));
    }
  }

  if (loading && !videos) {
    return <Loading />;
  }

  if (error || !videos) {
    return <ErrorState message={error ?? "No video tutorials found."} />;
  }

  const previewId = previewVideoId(form.videoUrl);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-foreground">Help Videos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tutorials shown in the mobile app under Help &amp; video. Paste a
            YouTube link — it is converted to a playable embed automatically.
          </p>
        </div>
        <Button onClick={openCreate}>Add tutorial</Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => !next && !saving && setOpen(false)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit tutorial" : "Add tutorial"}
            </DialogTitle>
            <DialogDescription>
              Only active tutorials appear in the app, ordered by the number you
              set below.
            </DialogDescription>
          </DialogHeader>

          {formError && <StatusAlert tone="failed">{formError}</StatusAlert>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="video-title" className="text-sm text-foreground">
                Title
              </label>
              <Input
                id="video-title"
                value={form.title}
                onChange={(event) => setField("title", event.target.value)}
                minLength={3}
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="video-description"
                className="text-sm text-foreground"
              >
                Description
              </label>
              <textarea
                id="video-description"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                minLength={10}
                maxLength={500}
                required
                className={`${nativeControlClass} min-h-20 resize-y py-2`}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="video-url" className="text-sm text-foreground">
                  YouTube link or video ID
                </label>
                <Input
                  id="video-url"
                  inputMode="url"
                  placeholder="https://youtu.be/dQw4w9WgXcQ"
                  value={form.videoUrl}
                  onChange={(event) => setField("videoUrl", event.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="video-duration"
                  className="text-sm text-foreground"
                >
                  Duration
                </label>
                <Input
                  id="video-duration"
                  placeholder="3:15 min"
                  value={form.duration}
                  onChange={(event) => setField("duration", event.target.value)}
                  required
                />
              </div>
            </div>

            {previewId ? (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Preview</p>
                <iframe
                  title="Tutorial preview"
                  src={`https://www.youtube.com/embed/${previewId}`}
                  referrerPolicy="no-referrer-when-downgrade"
                  allow="accelerometer; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="aspect-video w-full rounded-md border border-border bg-muted/40"
                />
              </div>
            ) : form.videoUrl.trim() ? (
              <p className="text-xs text-muted-foreground">
                Not a YouTube link — the app will open this address in its
                built-in player, which is unreliable for direct video files.
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="video-category" className="text-sm text-foreground">
                  Category
                </label>
                <select
                  id="video-category"
                  value={form.category}
                  onChange={(event) =>
                    setField("category", event.target.value as TutorialCategory)
                  }
                  className={nativeControlClass}
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="video-order" className="text-sm text-foreground">
                  Order
                </label>
                <Input
                  id="video-order"
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(event) => setField("order", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="video-color"
                  className="text-sm text-foreground"
                >
                  Banner colour
                </label>
                <input
                  id="video-color"
                  type="color"
                  value={form.thumbnailColor}
                  onChange={(event) =>
                    setField("thumbnailColor", event.target.value)
                  }
                  className="h-9 w-full cursor-pointer rounded-md border border-input bg-transparent px-2 shadow-xs"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setField("isActive", event.target.checked)}
                className="size-4 shrink-0 accent-primary"
              />
              Show this tutorial in the app
            </label>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DataTable
        columns={[
          {
            key: "thumbnailColor",
            header: "",
            render: (row) => (
              <span
                aria-hidden="true"
                className="block size-6 rounded-md border border-border"
                style={{ backgroundColor: row.thumbnailColor }}
              />
            ),
          },
          { key: "title", header: "Title" },
          {
            key: "category",
            header: "Category",
            hideOnMobile: true,
            render: (row) =>
              categories.find((entry) => entry.value === row.category)?.label ??
              row.category,
          },
          { key: "duration", header: "Duration", hideOnMobile: true },
          { key: "order", header: "Order", hideOnMobile: true },
          {
            key: "isActive",
            header: "Status",
            render: (row) => (
              <SubscriptionStatusBadge
                status={row.isActive ? "active" : "inactive"}
              />
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(row)}
                  disabled={saving}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleActive(row)}
                  disabled={saving}
                >
                  {row.isActive ? "Hide" : "Show"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(row)}
                  disabled={saving}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        data={videos}
        emptyMessage="No video tutorials yet — add the first one."
      />
    </div>
  );
}
