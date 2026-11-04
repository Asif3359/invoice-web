"use client";

import { cn } from "@/lib/utils";
import { DEFAULT_SITE_CONTACT, whatsappLink } from "@/lib/site-settings";
import { useSiteContact } from "@/lib/use-site-contact";

function supportAddress(email: string) {
  return email || DEFAULT_SITE_CONTACT.supportEmail;
}

/** Inline mailto for copy that names the support address (footer, policy pages). */
export function SupportEmail({ className }: { className?: string }) {
  const contact = useSiteContact();
  const email = supportAddress(contact.supportEmail);

  return (
    <a
      href={`mailto:${email}`}
      className={cn(
        "break-words text-primary underline-offset-4 transition-colors hover:underline",
        className,
      )}
    >
      {email}
    </a>
  );
}

/** Compact contact row for the footer brand block. */
export function SiteContactLinks() {
  const contact = useSiteContact();
  const email = supportAddress(contact.supportEmail);
  const whatsapp = whatsappLink(contact.whatsappNumber);

  const links = [
    { label: email, href: `mailto:${email}` },
    ...(whatsapp ? [{ label: "WhatsApp", href: whatsapp }] : []),
    ...(contact.facebookUrl
      ? [{ label: "Facebook", href: contact.facebookUrl }]
      : []),
    ...(contact.youtubeUrl
      ? [{ label: "YouTube", href: contact.youtubeUrl }]
      : []),
  ];

  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {links.map((link) => (
        <a
          key={link.href + link.label}
          href={link.href}
          {...(link.href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="break-words text-muted-foreground transition-colors hover:text-primary"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
