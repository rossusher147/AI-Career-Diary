import type { PropsWithChildren } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "./Button";

export function AuthGate({ children }: PropsWithChildren) {
  const { errorMessage, login, status } = useAuth();

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-12 text-ink">
      <section className="w-full max-w-md space-y-6 rounded-lg bg-surface-raised p-8 shadow-soft">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">AI Career Diary</h1>
          {status === "checking" ? (
            <div className="flex items-center gap-3 text-ink-muted" role="status">
              <span aria-label="Loading" className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <span>Checking your session...</span>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">{errorMessage ?? "We couldn't finish signing you in. Please try again."}</p>
          )}
        </div>
        {status === "error" ? (
          <Button onClick={login} variant="primary">
            Sign in
          </Button>
        ) : null}
        <p className="text-sm leading-6 text-ink-muted">Your diary is your private space to record your working day.</p>
      </section>
    </main>
  );
}
