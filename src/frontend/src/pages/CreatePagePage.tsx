import { Eye, Pencil, Save } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { TextareaField } from "../components/Field";
import { ErrorBlock } from "../components/Feedback";
import { MarkdownContent } from "../components/MarkdownContent";
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
  const [content, setContent] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.trim();
    setFieldError(null);
    setFormError(null);

    if (!trimmedContent) {
      setFieldError("Write a note before saving.");
      return;
    }

    setIsSubmitting(true);

    try {
      await diaryApi.createPage(diaryId, { content: trimmedContent });
      navigate(`/diaries/${diaryId}`, { state: { diaryName, pageSaved: true } });
    } catch {
      setFormError("We couldn't save this page. Please try again.");
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
          <Button onClick={() => setShowPreview((value) => !value)} type="button" variant="secondary">
            {showPreview ? <Pencil aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
            {showPreview ? "Hide preview" : "Show preview"}
          </Button>
        </section>

        {formError ? <ErrorBlock message={formError} title="Page could not be saved" /> : null}

        <section className={showPreview ? "grid gap-5 lg:grid-cols-2" : "grid gap-5"}>
          <div className="rounded-lg bg-surface-raised p-4 shadow-soft sm:p-5">
            <TextareaField
              error={fieldError}
              helper="Markdown is supported."
              label="Today's notes"
              name="page-content"
              onChange={(event) => setContent(event.target.value)}
              placeholder="Finished two jobs today..."
              value={content}
            />
          </div>

          {showPreview ? (
            <aside className="rounded-lg border border-ink/10 bg-surface-raised p-5 shadow-soft" aria-label="Markdown preview">
              <h2 className="mb-4 text-sm font-semibold text-ink-muted">Preview</h2>
              {content.trim() ? (
                <MarkdownContent content={content} />
              ) : (
                <p className="text-sm leading-6 text-ink-muted">Your preview will appear here as you write.</p>
              )}
            </aside>
          ) : null}
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={() => navigate(`/diaries/${diaryId}`)} type="button" variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} type="submit">
            <Save aria-hidden="true" className="h-4 w-4" />
            Save page
          </Button>
        </div>
      </form>
    </div>
  );
}
