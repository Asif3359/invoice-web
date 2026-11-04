"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { StatusAlert } from "@/components/status";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { nativeControlClass } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { businessApi } from "@/lib/business-api";
import { clearSession } from "@/lib/session";

const inputClassName = `${nativeControlClass} h-9`;

function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const message = (err.response?.data as { message?: string } | undefined)
      ?.message;
    if (message) return message;
  }
  return err instanceof Error ? err.message : fallback;
}

export default function BusinessSecurityPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);

    try {
      await businessApi.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      clearSession("business");
      router.replace("/login?notice=password-changed");
    } catch (err) {
      setPasswordError(
        getErrorMessage(
          err,
          "Could not change your password. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Security</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the password you use to sign in to your business account.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account security</CardTitle>
          <CardDescription>
            Change your password below. For your security you will be signed out
            and asked to sign in again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passwordError && (
            <div className="mb-4">
              <StatusAlert tone="failed">{passwordError}</StatusAlert>
            </div>
          )}

          <form
            onSubmit={handleChangePassword}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                className={inputClassName}
              />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                required
                className={inputClassName}
              />
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
                className={inputClassName}
              />
            </div>
            <div className="min-w-0 sm:col-span-2 xl:col-span-3">
              <p className="text-xs text-muted-foreground">
                At least 8 characters with an uppercase letter, a lowercase
                letter and a number.
              </p>
              <Button
                type="submit"
                disabled={saving}
                className="mt-3 w-full sm:w-auto"
              >
                {saving ? "Changing password..." : "Change password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
