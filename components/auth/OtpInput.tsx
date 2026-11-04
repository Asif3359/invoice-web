"use client";

import {
  ClipboardEvent,
  KeyboardEvent,
  useRef,
} from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const LENGTH = 6;

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: LENGTH }, (_, index) => value[index] ?? "");

  function focusInput(index: number) {
    const input = inputsRef.current[Math.max(0, Math.min(LENGTH - 1, index))];
    input?.focus();
    input?.select();
  }

  function handleChange(index: number, next: string) {
    const digit = next.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    onChange(nextDigits.join("").slice(0, LENGTH));

    if (digit) {
      focusInput(index + 1);
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      const nextDigits = [...digits];

      if (nextDigits[index]) {
        nextDigits[index] = "";
        onChange(nextDigits.join(""));
      } else if (index > 0) {
        nextDigits[index - 1] = "";
        onChange(nextDigits.join(""));
        focusInput(index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusInput(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, LENGTH);

    if (!pasted) return;

    onChange(pasted);
    focusInput(pasted.length);
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          aria-label={`Digit ${index + 1} of ${LENGTH}`}
          className="h-12 w-full min-w-0 rounded-xl border border-input bg-background text-center text-lg font-semibold text-foreground shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14"
        />
      ))}
    </div>
  );
}
