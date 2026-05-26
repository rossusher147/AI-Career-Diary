import { BookOpenText, LogOut } from "lucide-react";
import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "./Button";

export function AppShell({ children }: PropsWithChildren) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-ink/10 bg-surface-raised">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink" to="/diaries">
            <BookOpenText aria-hidden="true" className="h-5 w-5 text-accent" />
            <span>AI Career Diary</span>
          </Link>
          <Button aria-label="Sign out" onClick={logout} variant="ghost">
            <LogOut aria-hidden="true" className="h-4 w-4" />
            <span>Sign out</span>
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
