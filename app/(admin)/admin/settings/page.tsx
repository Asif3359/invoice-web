"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ErrorState } from "@/components/admin/ErrorState";
import { Loading } from "@/components/admin/Loading";
import { StatusAlert } from "@/components/status";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { clearSession } from "@/lib/session";

// ─── Extract the nested type ────────────────────────────────────────────────
type SystemSettings = {
  appName: string;
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
  maxSubUsersPerBusiness: number;
  supportEmail: string;
  whatsappNumber: string;
  phone: string;
  responseTime: string;
  address: string;
  facebookUrl: string;
  youtubeUrl: string;
};

type SettingsResponse = {
  success: boolean;
  data?: {
    settings: SystemSettings;
  };
};

type ApiErrorData = {
  message?: string;
  errors?: { msg?: string }[];
};

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<SettingsResponse>("/admin/settings");
        setForm(res.data.data?.settings ?? null);
      } catch {
        setError("Unable to load system settings from /admin/settings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function setField<K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K],
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!form) return;

    setSaveError(null);
    setSaving(true);

    try {
      const res = await api.patch<SettingsResponse>("/admin/settings", form);
      const saved = res.data.data?.settings;
      if (saved) setForm(saved);
      toast.success("Settings saved");
    } catch (err) {
      const data = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorData | undefined)
        : undefined;
      setSaveError(
        data?.errors?.[0]?.msg ??
          data?.message ??
          "Could not save the settings. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setSavingPassword(true);

    try {
      await api.post("/admin/auth/change-password", {
        currentPassword,
        newPassword,
      });
      clearSession("admin");
      router.replace("/login?notice=password-changed");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      setPasswordError(
        message ?? "Could not change your password. Please try again.",
      );
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (error || !form) {
    return <ErrorState message={error ?? "No system settings available."} />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

      <form onSubmit={handleSave} className="space-y-4">
        {saveError && <StatusAlert tone="failed">{saveError}</StatusAlert>}

        <Card>
          <CardHeader>
            <CardTitle>Public contact details</CardTitle>
            <CardDescription>
              Shown in the website contact section, the footer and the policy
              pages. Leave a field empty to hide it there.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field id="support-email" label="Support email">
              <Input
                id="support-email"
                type="email"
                value={form.supportEmail}
                onChange={(event) =>
                  setField("supportEmail", event.target.value)
                }
                placeholder="support@inventomanager.com"
              />
            </Field>
            <Field
              id="whatsapp-number"
              label="WhatsApp number"
              hint="Digits with country code, e.g. +8801XXXXXXXXX"
            >
              <Input
                id="whatsapp-number"
                type="tel"
                value={form.whatsappNumber}
                onChange={(event) =>
                  setField("whatsappNumber", event.target.value)
                }
                placeholder="+8801XXXXXXXXX"
              />
            </Field>
            <Field id="phone" label="Phone">
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                placeholder="+880 1XXX-XXXXXX"
              />
            </Field>
            <Field id="response-time" label="Response time">
              <Input
                id="response-time"
                type="text"
                value={form.responseTime}
                onChange={(event) =>
                  setField("responseTime", event.target.value)
                }
                placeholder="Within one business day"
              />
            </Field>
            <Field
              id="address"
              label="Office address"
              hint="Optional, up to 240 characters."
            >
              <Input
                id="address"
                type="text"
                value={form.address}
                onChange={(event) => setField("address", event.target.value)}
                placeholder="Dhaka, Bangladesh"
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:col-span-2 xl:grid-cols-2">
              <Field id="facebook-url" label="Facebook page URL">
                <Input
                  id="facebook-url"
                  type="url"
                  value={form.facebookUrl}
                  onChange={(event) =>
                    setField("facebookUrl", event.target.value)
                  }
                  placeholder="https://facebook.com/yourpage"
                />
              </Field>
              <Field id="youtube-url" label="YouTube channel URL">
                <Input
                  id="youtube-url"
                  type="url"
                  value={form.youtubeUrl}
                  onChange={(event) =>
                    setField("youtubeUrl", event.target.value)
                  }
                  placeholder="https://youtube.com/@yourchannel"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App behaviour</CardTitle>
            <CardDescription>
              Saved for reporting only — sign-up, maintenance mode and the
              sub-user cap are not enforced by these values yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Field id="app-name" label="App name">
                <Input
                  id="app-name"
                  type="text"
                  value={form.appName}
                  onChange={(event) => setField("appName", event.target.value)}
                />
              </Field>
              <Field id="max-sub-users" label="Max sub-users per business">
                <Input
                  id="max-sub-users"
                  type="number"
                  min={1}
                  max={100}
                  value={form.maxSubUsersPerBusiness}
                  onChange={(event) =>
                    setField(
                      "maxSubUsersPerBusiness",
                      Number(event.target.value) || 1,
                    )
                  }
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="size-4 shrink-0 accent-primary"
                  checked={form.allowNewRegistrations}
                  onChange={(event) =>
                    setField("allowNewRegistrations", event.target.checked)
                  }
                />
                Allow new registrations
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="size-4 shrink-0 accent-primary"
                  checked={form.maintenanceMode}
                  onChange={(event) =>
                    setField("maintenanceMode", event.target.checked)
                  }
                />
                Maintenance mode
              </label>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Account security</CardTitle>
          <CardDescription>
            Change the password for your system admin account. You will be
            signed out and asked to sign in again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passwordError && (
            <StatusAlert tone="failed">{passwordError}</StatusAlert>
          )}

          <form
            onSubmit={handleChangePassword}
            className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-3 sm:col-span-3">
              <p className="text-xs text-muted-foreground">
                At least 8 characters with an uppercase letter, a lowercase
                letter and a number.
              </p>
              <Button
                type="submit"
                disabled={savingPassword}
                className="w-full sm:w-auto"
              >
                {savingPassword ? "Changing password..." : "Change password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
