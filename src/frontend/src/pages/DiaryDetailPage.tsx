import { AlertCircle, ArrowLeft, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import type { DiaryRead, PageRead } from "../api/types";
import { BookSpread } from "../components/BookSpread";
import { Button } from "../components/Button";
import { ErrorBlock, LoadingBlock, StatusMessage } from "../components/Feedback";
import { useDiaryApi } from "../hooks";
import { isNotFound } from "../utils/errors";

interface LocationState {
  diaryName?: string;
  pageSaved?: boolean;
}

export function DiaryDetailPage() {
  const diaryApi = useDiaryApi();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const diaryId = Number(params.diaryId);
  const state = (location.state ?? {}) as LocationState;
  const [diaries, setDiaries] = useState<DiaryRead[]>([]);
  const [pages, setPages] = useState<PageRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const diaryName = useMemo(() => {
    return diaries.find((diary) => diary.id === diaryId)?.name ?? state.diaryName ?? "Work Diary";
  }, [diaries, diaryId, state.diaryName]);

  async function loadDiary() {
    if (!Number.isInteger(diaryId)) {
      setError("We couldn't find that diary.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [diaryList, pageList] = await Promise.all([diaryApi.getDiaries(), diaryApi.getPages(diaryId)]);
      setDiaries(diaryList);
      setPages(pageList);
    } catch (caughtError) {
      setError(isNotFound(caughtError) ? "We couldn't find that diary." : "We couldn't load this diary's pages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDiary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diaryId]);

  return (
    <div className="space-y-6">
      <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink" to="/diaries">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Diaries
      </Link>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-ink">{diaryName}</h1>
          <p className="text-sm leading-6 text-ink-muted">Pages from your working day.</p>
        </div>
        <Button onClick={() => navigate(`/diaries/${diaryId}/pages/new`, { state: { diaryName } })}>
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add page
        </Button>
      </section>

      {state.pageSaved ? <StatusMessage>Page saved.</StatusMessage> : null}

      {isLoading ? <LoadingBlock message="Loading this diary..." /> : null}

      {!isLoading && error ? (
        <ErrorBlock
          icon={<AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5" />}
          message={error}
          onAction={error.includes("find") ? () => navigate("/diaries") : loadDiary}
          actionLabel={error.includes("find") ? "Back to diaries" : "Retry"}
          title={error.includes("find") ? "Diary not found" : "Pages could not load"}
        />
      ) : null}

      {!isLoading && !error ? <BookSpread onAddPage={() => navigate(`/diaries/${diaryId}/pages/new`, { state: { diaryName } })} pages={pages} /> : null}
    </div>
  );
}
