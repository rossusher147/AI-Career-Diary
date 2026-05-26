import type { PropsWithChildren, ReactNode } from "react";
import { Button } from "./Button";

interface FeedbackProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function LoadingBlock({ message = "Loading" }: { message?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-ink/10 bg-surface-raised p-6" role="status">
      <div className="flex items-center gap-3 text-ink-muted">
        <span aria-label="Loading" className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <span>{message}</span>
      </div>
    </div>
  );
}

export function ErrorBlock({ actionLabel = "Retry", icon, message, onAction, title = "Something went wrong" }: FeedbackProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          {icon}
          <div className="space-y-1">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-sm leading-6">{message}</p>
          </div>
        </div>
        {onAction ? (
          <Button onClick={onAction} variant="secondary">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function StatusMessage({ children }: PropsWithChildren) {
  return (
    <p className="rounded-md border border-accent/20 bg-accent-soft px-3 py-2 text-sm font-medium text-accent-strong" role="status">
      {children}
    </p>
  );
}
