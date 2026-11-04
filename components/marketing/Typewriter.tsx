"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TYPE_MS = 190;
const DELETE_MS = 90;
const HOLD_MS = 2200;
const GAP_MS = 220;

type TypewriterProps = {
  /** Cycled in order; every entry is measured so the slot never reflows. */
  words: readonly string[];
  /** Applied to the painted text, not the sizing wrapper. */
  className?: string;
  startDelayMs?: number;
};

export function Typewriter({
  words,
  className,
  startDelayMs = 0,
}: TypewriterProps) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(words[0]?.length ?? 0);
  const [deleting, setDeleting] = useState(false);
  const [running, setRunning] = useState(false);

  const word = words[index] ?? "";

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The prerendered first word is complete, so the loop starts by erasing it
    // instead of jumping straight to an empty slot.
    const timer = setTimeout(() => {
      setDeleting(true);
      setRunning(true);
    }, startDelayMs);

    return () => clearTimeout(timer);
  }, [startDelayMs]);

  useEffect(() => {
    if (!running || word.length === 0) return;

    if (deleting && length === 0) {
      // Brief pause on an empty slot before the next word starts typing.
      const timer = setTimeout(() => {
        setDeleting(false);
        setIndex((current) => (current + 1) % words.length);
      }, GAP_MS);
      return () => clearTimeout(timer);
    }

    if (deleting) {
      const timer = setTimeout(
        () => setLength((current) => current - 1),
        DELETE_MS,
      );
      return () => clearTimeout(timer);
    }

    if (length >= word.length) {
      const timer = setTimeout(() => setDeleting(true), HOLD_MS);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setLength((current) => current + 1), TYPE_MS);
    return () => clearTimeout(timer);
  }, [running, deleting, length, word, words.length]);

  return (
    <span className="inline-grid">
      {words.map((candidate) => (
        <span
          key={candidate}
          aria-hidden="true"
          className="invisible col-start-1 row-start-1 whitespace-nowrap"
        >
          {candidate}
        </span>
      ))}
      <span
        aria-hidden="true"
        className={cn(
          "justify-self-start col-start-1 row-start-1 whitespace-nowrap",
          running && "type-caret",
          className,
        )}
      >
        {running ? word.slice(0, length) : word}
      </span>
      <span className="sr-only">{word}</span>
    </span>
  );
}
