import { AlertCircle, ArrowLeft, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import type { DiaryRead, PageRead } from "../api/types";
import { BookSpread } from "../components/BookSpread";
import { Button } from "../components/Button";
import { DateFilterControl, type DateFilterValue, formatDateFilterValue } from "../components/DateFilterControl";
import { EmptyState } from "../components/EmptyState";
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
  const [dateFilter, setDateFilter] = useState<DateFilterValue | null>(null);

  const diaryName = useMemo(() => {
    return diaries.find((diary) => diary.id === diaryId)?.name ?? state.diaryName ?? "Work Diary";
  }, [diaries, diaryId, state.diaryName]);

  const filteredPages = useMemo(() => {
    if (!dateFilter) {
      return pages;
    }

    return pages.filter((page) => pageMatchesDateFilter(page, dateFilter));
  }, [dateFilter, pages]);

  const isDateFiltered = Boolean(dateFilter);

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
    <div className="diary-detail">
      <section className="diary-detail__header">
        <div className="diary-detail__heading">
          <Link className="diary-detail__back-link" to="/diaries">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Diaries
          </Link>
          <div className="space-y-1">
            <h1 className="diary-detail__title">{diaryName}</h1>
            <p className="text-sm leading-6 text-ink-muted">Pages from your working day.</p>
          </div>
        </div>
        <div className="diary-actions">
          <Button onClick={() => navigate(`/diaries/${diaryId}/pages/new`, { state: { diaryName } })}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add page
          </Button>
        </div>
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

      {!isLoading && !error && pages.length > 0 ? (
        <div className="book-toolbar">
          <DateFilterControl onChange={setDateFilter} value={dateFilter} />
        </div>
      ) : null}

      {!isLoading && !error && isDateFiltered && filteredPages.length === 0 ? (
        <EmptyState
          action={
            <Button onClick={() => setDateFilter(null)} variant="secondary">
              Clear date filter
            </Button>
          }
          body={`No pages were found for ${dateFilter ? formatDateFilterValue(dateFilter) : "that date filter"}.`}
          title="No pages match this date"
        />
      ) : null}

      {!isLoading && !error && (!isDateFiltered || filteredPages.length > 0) ? (
        <BookSpread onAddPage={() => navigate(`/diaries/${diaryId}/pages/new`, { state: { diaryName } })} pages={filteredPages} />
      ) : null}
    </div>
  );
}

function pageMatchesDateFilter(page: PageRead, filter: DateFilterValue): boolean {
  const pageDate = toInputDateValue(page.created_at);

  if (!pageDate) {
    return false;
  }

  if (filter.mode === "day") {
    return pageDate === filter.date;
  }

  const startDate = filter.startDate;
  const endDate = filter.endDate;

  if (startDate && pageDate < startDate) {
    return false;
  }

  if (endDate && pageDate > endDate) {
    return false;
  }

  return true;
}

function toInputDateValue(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
