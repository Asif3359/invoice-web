"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_SITE_CONTACT,
  fetchPublicSiteContact,
  type PublicSiteContact,
} from "./site-settings";

/**
 * Contact details managed by the superadmin. Starts on the built-in defaults so
 * the marketing pages are never blank while loading or if the API is down.
 */
export function useSiteContact(): PublicSiteContact {
  const [contact, setContact] = useState<PublicSiteContact>(DEFAULT_SITE_CONTACT);

  useEffect(() => {
    let cancelled = false;

    fetchPublicSiteContact()
      .then((data) => {
        if (!cancelled) setContact(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return contact;
}
