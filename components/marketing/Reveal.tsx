"use client";

import { CSSProperties, ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger in milliseconds, so sibling items do not all appear at once. */
  delay?: number;
};

/**
 * Sections are prerendered visible and only hidden once the observer is
 * attached, so the copy never depends on JavaScript to be readable.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    node.dataset.reveal = "pending";

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          node.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      delete node.dataset.reveal;
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
