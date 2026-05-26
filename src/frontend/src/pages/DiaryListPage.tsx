import { AlertCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { DiaryRead } from "../api/types";
import { Button } from "../components/Button";
import { ErrorBlock, LoadingBlock } from "../components/Feedback";
import { useDiaryApi } from "../hooks";

export function DiaryListPage() {
  const diaryApi = useDiaryApi();
  const navigate = useNavigate();
  const [diaries, setDiaries] = useState<DiaryRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDiaries() {
    setIsLoading(true);
    setError(null);

    try {
      setDiaries(await diaryApi.getDiaries());
    } catch {
      setError("We couldn't load your diaries. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDiaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-normal text-ink">Your diaries</h1>
          <p className="max-w-2xl text-sm leading-6 text-ink-muted">
            Keep a private record of your working day, one page at a time.
          </p>
        </div>
        <Button onClick={() => navigate("/diaries/new")}>
          <Plus aria-hidden="true" className="h-4 w-4" />
          Create diary
        </Button>
      </section>

      {isLoading ? <LoadingBlock message="Loading your diaries..." /> : null}

      {!isLoading && error ? (
        <ErrorBlock
          icon={<AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5" />}
          message={error}
          onAction={loadDiaries}
          title="Diaries could not load"
        />
      ) : null}

      {!isLoading && !error && diaries.length === 0 ? (
        <p className="rounded-md border border-ink/10 bg-surface-raised px-4 py-3 text-sm text-ink-muted">
          You have not created any work diaries yet.
        </p>
      ) : null}

      {!isLoading && !error && diaries.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Diary list">
          {diaries.map((diary) => (
            <Link
              className="group rounded-lg border border-ink/10 bg-surface-raised p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              key={diary.id}
              to={`/diaries/${diary.id}`}
            >
              <article className="space-y-3">
                <h2 className="text-lg font-semibold text-ink group-hover:text-accent-strong">{diary.name}</h2>
                <p className="text-sm leading-6 text-ink-muted">Open diary</p>
              </article>
            </Link>
          ))}
        </section>
      ) : null}
    </div>
  );
}
