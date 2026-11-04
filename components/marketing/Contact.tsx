"use client";

import { FormEvent, useState } from "react";
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, nativeControlClass } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_SITE_CONTACT,
  whatsappLink,
  type PublicSiteContact,
} from "@/lib/site-settings";
import { useSiteContact } from "@/lib/use-site-contact";

type Channel = {
  Icon: typeof EnvelopeIcon;
  label: string;
  value: string;
  href?: string;
};

function buildChannels(contact: PublicSiteContact): Channel[] {
  const phoneHref = contact.phone
    ? `tel:${contact.phone.replace(/[^\d+]/g, "")}`
    : undefined;

  return [
    contact.supportEmail && {
      Icon: EnvelopeIcon,
      label: "Email us",
      value: contact.supportEmail,
      href: `mailto:${contact.supportEmail}`,
    },
    contact.whatsappNumber && {
      Icon: ChatBubbleLeftRightIcon,
      label: "WhatsApp",
      value: contact.whatsappNumber,
      href: whatsappLink(contact.whatsappNumber) ?? undefined,
    },
    contact.phone && {
      Icon: PhoneIcon,
      label: "Phone",
      value: contact.phone,
      href: phoneHref,
    },
    contact.responseTime && {
      Icon: ClockIcon,
      label: "Response time",
      value: contact.responseTime,
    },
    contact.address && {
      Icon: MapPinIcon,
      label: "Office",
      value: contact.address,
    },
  ].filter((channel): channel is Channel => Boolean(channel));
}

export function Contact() {
  const contact = useSiteContact();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const supportEmail =
      contact.supportEmail || DEFAULT_SITE_CONTACT.supportEmail;
    const subject = `Website enquiry from ${name || "a visitor"}`;
    const body = `${message}\n\n— ${name}\n${email}`;
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  const channels = buildChannels(contact);
  const socials = [
    { label: "Facebook", href: contact.facebookUrl },
    { label: "YouTube", href: contact.youtubeUrl },
  ].filter((social) => social.href);

  return (
    <section
      id="contact"
      className="scroll-mt-16 border-t border-border bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <Reveal>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Contact
              </p>
              <h2 className="mt-3 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Talk to us before you commit
              </h2>
              <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground">
                Ask about migration from your current software, sub-user limits
                or anything that does not fit on this page. A real person reads
                every message.
              </p>

              <ul className="mt-8 space-y-4">
                {channels.map(({ Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Icon
                        className="size-5 text-primary"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                      </span>
                      {href ? (
                        <a
                          href={href}
                          {...(href.startsWith("http")
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="break-words text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                        >
                          {value}
                        </a>
                      ) : (
                        <span className="block text-sm font-medium text-foreground">
                          {value}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {socials.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={120} className="flex">
            <Card className="w-full gap-0 py-0">
              <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
                <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-name">Name</Label>
                      <Input
                        id="contact-name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col gap-1.5">
                    <Label htmlFor="contact-message">Message</Label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      required
                      placeholder="What would you like to know?"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      className={`${nativeControlClass} min-h-28 flex-1 resize-none py-2`}
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="submit" className="w-full sm:w-auto">
                      Send message
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Opens your email app with the message ready to go.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
