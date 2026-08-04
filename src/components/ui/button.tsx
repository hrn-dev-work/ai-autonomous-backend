import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium tracking-tight transition-[transform,background-color,box-shadow] duration-200 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-[var(--accent)] text-[var(--accent-fg)] shadow-[0_1px_0_rgba(15,23,20,0.08)] hover:bg-[var(--accent-hover)] active:translate-y-px",
        variant === "ghost" &&
          "bg-transparent text-[var(--ink)] ring-1 ring-[var(--line)] hover:bg-[var(--surface-2)]",
        className,
      )}
      {...props}
    />
  );
}
