/**
 * Decorative product mockups drawn as inline SVG so they stay crisp at every
 * size and pick up the theme tokens. They are labelled by the surrounding
 * copy, so each one is hidden from assistive tech.
 */

import type { CSSProperties } from "react";

export function DashboardVisual() {
  return (
    <svg
      viewBox="0 0 640 400"
      role="presentation"
      aria-hidden="true"
      className="h-auto w-full"
    >
      <rect
        width="640"
        height="400"
        rx="16"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <path
        d="M0 16a16 16 0 0 1 16-16h64v400H16A16 16 0 0 1 0 384Z"
        className="fill-muted"
      />
      {[52, 84, 116, 148, 180].map((y, i) => (
        <g key={y}>
          <rect
            x="24"
            y={y}
            width="36"
            height="8"
            rx="4"
            className={i === 0 ? "fill-primary" : "fill-border"}
          />
          <rect
            x="68"
            y={y}
            width={i === 0 ? 44 : 36}
            height="8"
            rx="4"
            className={i === 0 ? "fill-primary" : "fill-border"}
          />
        </g>
      ))}

      <rect x="104" y="32" width="140" height="10" rx="5" className="fill-foreground/80" />
      <rect x="104" y="52" width="72" height="8" rx="4" className="fill-border" />

      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={104 + i * 132}
            y="84"
            width="120"
            height="64"
            rx="10"
            className="fill-secondary stroke-border"
            strokeWidth="1.5"
          />
          <rect
            x={118 + i * 132}
            y="100"
            width="48"
            height="6"
            rx="3"
            className="fill-border"
          />
          <rect
            x={118 + i * 132}
            y="116"
            width={i === 1 ? 62 : 54}
            height="12"
            rx="4"
            className="fill-primary"
          />
        </g>
      ))}

      <rect
        x="104"
        y="168"
        width="264"
        height="140"
        rx="10"
        className="fill-card stroke-border"
        strokeWidth="1.5"
      />
      <rect x="120" y="184" width="80" height="8" rx="4" className="fill-border" />
      {[96, 64, 112, 48, 80, 56, 104].map((h, i) => (
        <rect
          key={i}
          x={124 + i * 32}
          y={288 - h}
          width="20"
          height={h}
          rx="4"
          className={`bar-grow ${i % 3 === 1 ? "fill-primary" : "fill-accent"}`}
          style={{ "--bar-delay": `${450 + i * 70}ms` } as CSSProperties}
        />
      ))}

      <rect
        x="384"
        y="168"
        width="240"
        height="140"
        rx="10"
        className="fill-card stroke-border"
        strokeWidth="1.5"
      />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x="400"
            y={188 + i * 30}
            width="120"
            height="8"
            rx="4"
            className="fill-border"
          />
          <rect
            x="548"
            y={188 + i * 30}
            width={i === 2 ? 60 : 44}
            height="8"
            rx="4"
            className={i === 0 ? "fill-primary" : "fill-muted"}
          />
        </g>
      ))}
    </svg>
  );
}

export function InvoiceVisual() {
  return (
    <svg
      viewBox="0 0 400 300"
      role="presentation"
      aria-hidden="true"
      className="h-auto w-full"
    >
      <rect
        x="8"
        y="8"
        width="384"
        height="284"
        rx="14"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <rect x="32" y="36" width="104" height="12" rx="6" className="fill-foreground/80" />
      <rect x="32" y="58" width="64" height="8" rx="4" className="fill-border" />
      <rect x="272" y="36" width="88" height="24" rx="12" className="fill-secondary stroke-primary/30" />

      <path d="M32 88h304" className="stroke-border" strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x="32"
            y={108 + i * 28}
            width={140 - i * 12}
            height="8"
            rx="4"
            className="fill-border"
          />
          <rect
            x="288"
            y={108 + i * 28}
            width="48"
            height="8"
            rx="4"
            className="fill-muted"
          />
        </g>
      ))}

      <path d="M32 224h304" className="stroke-border" strokeWidth="2" />
      <rect x="200" y="238" width="64" height="8" rx="4" className="fill-border" />
      <rect x="276" y="234" width="60" height="14" rx="5" className="fill-primary" />
      <rect x="32" y="240" width="96" height="10" rx="5" className="fill-secondary stroke-primary/20" />
    </svg>
  );
}

export function MobileVisual() {
  return (
    <svg
      viewBox="0 0 400 300"
      role="presentation"
      aria-hidden="true"
      className="h-auto w-full"
    >
      <rect
        x="146"
        y="12"
        width="108"
        height="276"
        rx="24"
        className="fill-foreground stroke-border"
        strokeWidth="2"
      />
      <rect
        x="156"
        y="26"
        width="88"
        height="248"
        rx="16"
        className="fill-card"
      />
      <rect x="188" y="34" width="24" height="4" rx="2" className="fill-border" />

      <rect x="170" y="52" width="48" height="8" rx="4" className="fill-foreground/80" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x="170"
            y={76 + i * 42}
            width="60"
            height="32"
            rx="8"
            className="fill-secondary stroke-border"
            strokeWidth="1"
          />
          <rect
            x="178"
            y={84 + i * 42}
            width="32"
            height="6"
            rx="3"
            className="fill-border"
          />
          <rect
            x="178"
            y={96 + i * 42}
            width="24"
            height="6"
            rx="3"
            className={i === 0 ? "fill-primary" : "fill-accent"}
          />
        </g>
      ))}

      <rect x="240" y="76" width="4" height="188" rx="2" className="fill-muted" />
    </svg>
  );
}

export function InventoryVisual() {
  return (
    <svg
      viewBox="0 0 400 300"
      role="presentation"
      aria-hidden="true"
      className="h-auto w-full"
    >
      <rect
        x="8"
        y="8"
        width="384"
        height="284"
        rx="14"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <rect x="32" y="36" width="112" height="12" rx="6" className="fill-foreground/80" />

      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const x = 32 + col * 116;
          const y = 72 + row * 68;
          const isLow = row === 2 && col === 1;
          return (
            <g key={`${row}-${col}`}>
              <rect
                x={x}
                y={y}
                width="100"
                height="52"
                rx="10"
                className="fill-secondary stroke-border"
                strokeWidth="1.5"
              />
              <rect
                x={x + 12}
                y={y + 14}
                width="44"
                height="7"
                rx="3.5"
                className="fill-border"
              />
              <rect
                x={x + 12}
                y={y + 30}
                width={isLow ? 22 : 60}
                height="8"
                rx="4"
                className={isLow ? "fill-destructive" : "fill-primary"}
              />
            </g>
          );
        }),
      )}
    </svg>
  );
}
