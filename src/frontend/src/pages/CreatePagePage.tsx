import { Save } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import type { PageRead } from "../api/types";
import { Button } from "../components/Button";
import { ErrorBlock, LoadingBlock } from "../components/Feedback";
import { MarkdownEditorField } from "../components/MarkdownEditorField";
import { DatePickerField } from "../components/DatePickerField";
import { useDiaryApi } from "../hooks";

interface LocationState {
  diaryName?: string;
}

export function CreatePagePage() {
  const diaryApi = useDiaryApi();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const diaryId = Number(params.diaryId);
  const state = (location.state ?? {}) as LocationState;
  const diaryName = state.diaryName ?? "Work Diary";

  const today = new Date().toISOString().split("T")[0];

  const [content, setContent] = useState("");
  const [pageDate, setPageDate] = useState(today);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pages, setPages] = useState<PageRead[]>([]);
  const [isCheckingDates, setIsCheckingDates] = useState(true);
  const [dateCheckError, setDateCheckError] = useState<string | null>(null);
  const [dateCheckAttempt, setDateCheckAttempt] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadPages() {
      if (!Number.isInteger(diaryId)) {
        setDateCheckError("We couldn't find that diary.");
        setIsCheckingDates(false);
        return;
      }

      setIsCheckingDates(true);
      setDateCheckError(null);

      try {
        const loadedPages = await diaryApi.getPages(diaryId);

        if (isActive) {
          setPages(loadedPages);
        }
      } catch {
        if (isActive) {
          setDateCheckError("We couldn't check existing pages. Please try again.");
        }
      } finally {
        if (isActive) {
          setIsCheckingDates(false);
        }
      }
    }

    loadPages();

    return () => {
      isActive = false;
    };
  }, [dateCheckAttempt, diaryApi, diaryId]);

  const existingPageForDate = useMemo(() => {
    if (!pageDate) {
      return null;
    }

    return pages.find((page) => toPageDateValue(page.created_at) === pageDate) ?? null;
  }, [pageDate, pages]);

  const isEditorBlocked = isCheckingDates || Boolean(dateCheckError) || Boolean(existingPageForDate);

  function handleDateChange(value: string) {
    setPageDate(value);
    setDateError(null);
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.trim();
    setFieldError(null);
    setDateError(null);
    setFormError(null);

    if (isEditorBlocked) {
      return;
    }

    if (!trimmedContent) {
      setFieldError("Write a note before saving.");
      return;
    }

    if (!pageDate) {
      setDateError("Please select a date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const dateTime = new Date(`${pageDate}T00:00:00Z`).toISOString();

      await diaryApi.createPage(diaryId, { content: trimmedContent, created_at: dateTime });
      navigate(`/diaries/${diaryId}`, { state: { diaryName, pageSaved: true } });
    } catch (error: any) {
      if (error?.status === 409 || error?.message?.includes("unique")) {
        setFormError("A page already exists for this date. Choose another date or open the existing page.");
        setDateCheckAttempt((currentAttempt) => currentAttempt + 1);
      } else {
        setFormError("We couldn't save this page. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink-muted">{diaryName}</p>
            <h1 className="text-3xl font-semibold text-ink">New page</h1>
            <p className="text-sm leading-6 text-ink-muted">A few lines from today is enough.</p>
          </div>
        </section>

        {formError ? <ErrorBlock message={formError} title="Page could not be saved" /> : null}

        <section className="space-y-4">
          <DatePickerField
            error={dateError}
            label="Date"
            name="page-date"
            onChange={handleDateChange}
            value={pageDate}
            helper="Select today or any date in the past."
          />
          {isCheckingDates ? <LoadingBlock message="Checking existing pages..." /> : null}
          {dateCheckError ? (
            <ErrorBlock
              actionLabel="Retry"
              message={dateCheckError}
              onAction={() => setDateCheckAttempt((currentAttempt) => currentAttempt + 1)}
              title="Date check failed"
            />
          ) : null}
          {!isCheckingDates && !dateCheckError && existingPageForDate ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-950" role="alert">
              <div className="space-y-1">
                <h2 className="text-base font-semibold">A page already exists for this date</h2>
                <p className="text-sm leading-6">
                  Choose another date above to back-date this page, or{" "}
                  <Link
                    className="font-medium underline underline-offset-2 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 focus-visible:ring-offset-red-50"
                    state={{ diaryName, pageData: existingPageForDate }}
                    to={`/diaries/${diaryId}/pages/${existingPageForDate.id}/edit`}
                  >
                    open the existing page
                  </Link>
                  .
                </p>
              </div>
            </div>
          ) : null}
          {!isEditorBlocked ? (
            <MarkdownEditorField
              error={fieldError}
              label="Today's notes"
              name="page-content"
              onChange={setContent}
              placeholder="Write your notes here..."
              value={content}
            />
          ) : null}
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={() => navigate(`/diaries/${diaryId}`)} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={isEditorBlocked} isLoading={isSubmitting} type="submit">
            <Save aria-hidden="true" className="h-4 w-4" />
            Save page
          </Button>
        </div>
      </form>
    </div>
  );
}

function toPageDateValue(value: string) {
  const [datePart] = value.split("T");

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return datePart;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
}
