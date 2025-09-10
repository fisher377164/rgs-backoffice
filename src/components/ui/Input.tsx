"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-8 px-3 rounded-lg border border-[var(--border)] bg-white text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400",
        className
      )}
      {...props}
    />
  );
}
