import Link from "next/link";
import { SiteContactLinks } from "@/components/marketing/SiteContactLinks";

const columns = [
  {
    heading: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/#contact", label: "Contact" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/login", label: "Login" },
      { href: "/register", label: "Create account" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/data-security-policy", label: "Data Security Policy" },
      { href: "/return-refund-policy", label: "Return & Refund Policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto shrink-0 border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <p className="text-base">
              <span className="font-bold text-primary">Invento</span>{" "}
              <span className="font-light text-muted-foreground">manager</span>
            </p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
              Streamline your invoicing, payments, and inventory management.
            </p>
            <SiteContactLinks />
          </div>
          {columns.map((column) => (
            <div key={column.heading}>
              <h4 className="text-sm font-semibold text-foreground">
                {column.heading}
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground sm:mt-8 sm:pt-8">
          &copy; {new Date().getFullYear()} Invento Manager. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
