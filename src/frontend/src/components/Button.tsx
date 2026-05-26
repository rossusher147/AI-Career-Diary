import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong focus-visible:ring-accent",
  secondary:
    "border border-ink/15 bg-surface-raised text-ink hover:bg-surface-muted focus-visible:ring-accent",
  ghost: "text-ink hover:bg-surface-muted focus-visible:ring-accent",
  danger: "bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-700"
};

export function Button({
  children,
  className = "",
  disabled,
  isLoading = false,
  type = "button",
  variant = "primary",
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={[
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className
      ].join(" ")}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      <span>{children}</span>
    </button>
  );
}
