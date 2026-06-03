import { Save } from "lucide-react";
import { FormEvent, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { ErrorBlock } from "../components/Feedback";
import { MarkdownEditorField } from "../components/MarkdownEditorField";
import { DatePickerField } from "../components/DatePickerField";
import { useDiaryApi } from "../hooks";

interface LocationState {
  diaryName?: string;
  pageData?: {
    id: number;
    created_at: string;
    content: string;
  };
}

export function EditPagePage() {
  const diaryApi = useDiaryApi();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const diaryId = Number(params.diaryId);
  const pageId = Number(params.pageId);
  const state = (location.state ?? {}) as LocationState;
  const diaryName = state.diaryName ?? "Work Diary";
  const pageData = state.pageData;

  // Initialize date from pageData's created_at (extract just the date part)
  const initialDate = pageData ? pageData.created_at.split('T')[0] : new Date().toISOString().split('T')[0];

  const [content, setContent] = useState(pageData?.content ?? "");
  const [pageDate, setPageDate] = useState(initialDate);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no pageData is provided
  useEffect(() => {
    if (!pageData) {
      navigate(`/diaries/${diaryId}`);
    }
  }, [pageData, diaryId, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.trim();
    setFieldError(null);
    setFormError(null);

    if (!trimmedContent) {
      setFieldError("Write a note before saving.");
      return;
    }

    if (!pageDate) {
      setFormError("Please select a date.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert date string to ISO format datetime at UTC midnight
      const dateTime = new Date(pageDate + 'T00:00:00Z').toISOString();
      
      await diaryApi.updatePage(diaryId, pageId, {
        content: trimmedContent,
        created_at: dateTime
      });

      // Navigate back to diary view with the page's date to show it
      navigate(`/diaries/${diaryId}`, { state: { diaryName, pageSaved: true } });
    } catch {
      setFormError("We couldn't save this page. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!pageData) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="space-y-6">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink-muted">{diaryName}</p>
            <h1 className="text-3xl font-semibold text-ink">Edit page</h1>
            <p className="text-sm leading-6 text-ink-muted">Update your notes for this day.</p>
          </div>
        </section>

        {formError ? <ErrorBlock message={formError} title="Page could not be saved" /> : null}

        <section className="rounded-lg bg-surface-raised p-4 shadow-soft sm:p-5 space-y-4">
          <DatePickerField
            label="Date"
            name="page-date"
            onChange={setPageDate}
            value={pageDate}
            helper="You can only edit pages on the same date or change to a date in the past."
          />
          <MarkdownEditorField
            error={fieldError}
            label="Notes"
            name="page-content"
            onChange={setContent}
            placeholder="Write your notes here..."
            value={content}
          />
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={() => navigate(`/diaries/${diaryId}`)} type="button" variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} type="submit">
            <Save aria-hidden="true" className="h-4 w-4" />
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
