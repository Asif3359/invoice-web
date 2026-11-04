"use client";

import type { ReactNode } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/** Hamburger + left drawer, shown below `lg` where the static sidebar is hidden. */
export function MobileNavSheet({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          aria-label={`Open ${label} menu`}
        >
          <Bars3Icon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] gap-0 p-0 sm:max-w-xs">
        <SheetHeader className="sr-only">
          <SheetTitle>{label} navigation</SheetTitle>
          <SheetDescription>Site sections of the {label} dashboard</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
