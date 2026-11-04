import { businessApi } from "./business-api";

export type PublicSiteContact = {
  appName: string;
  supportEmail: string;
  whatsappNumber: string;
  phone: string;
  responseTime: string;
  address: string;
  facebookUrl: string;
  youtubeUrl: string;
};

/**
 * Rendered before the admin-managed values arrive and kept as the fallback when
 * the endpoint is unreachable, so the contact block is never empty.
 */
export const DEFAULT_SITE_CONTACT: PublicSiteContact = {
  appName: "Invento Manager",
  supportEmail: "support@inventomanager.com",
  whatsappNumber: "",
  phone: "",
  responseTime: "Within one business day",
  address: "",
  facebookUrl: "",
  youtubeUrl: "",
};

type SiteSettingsResponse = {
  success?: boolean;
  data?: { contact?: Partial<Record<keyof PublicSiteContact, unknown>> };
};

export async function fetchPublicSiteContact(): Promise<PublicSiteContact> {
  const { data } = await businessApi.get<SiteSettingsResponse>(
    "/site-settings/public",
  );

  const contact = data?.data?.contact ?? {};
  const resolved: PublicSiteContact = { ...DEFAULT_SITE_CONTACT };

  for (const key of Object.keys(DEFAULT_SITE_CONTACT) as (keyof PublicSiteContact)[]) {
    const value = contact[key];
    if (typeof value === "string") resolved[key] = value;
  }

  return resolved;
}

/** wa.me only accepts digits; returns null when no number is configured. */
export function whatsappLink(number: string): string | null {
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}
