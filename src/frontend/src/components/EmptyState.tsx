import type { PropsWithChildren, ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  body: string;
  action?: ReactNode;
}

export function EmptyState({ action, body, children, title }: PropsWithChildren<EmptyStateProps>) {
  return (
    <section className="rounded-lg border border-dashed border-ink/20 bg-surface-raised p-6 text-center shadow-soft">
      <div className="mx-auto max-w-md space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          <p className="text-sm leading-6 text-ink-muted">{body}</p>
        </div>
        {children}
        {action}
      </div>
    </section>
  );
}
