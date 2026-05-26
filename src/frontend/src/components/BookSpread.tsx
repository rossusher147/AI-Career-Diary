import type { PageRead } from "../api/types";
import { formatPageDate } from "../utils/dates";
import { Button } from "./Button";
import { MarkdownContent } from "./MarkdownContent";

interface BookSpreadProps {
  pages: PageRead[];
  onAddPage: () => void;
}

export function BookSpread({ onAddPage, pages }: BookSpreadProps) {
  if (pages.length === 0) {
    return (
      <section className="book-spread" aria-label="Diary pages">
        <article className="book-page flex flex-col justify-center">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Your first page is ready</h2>
              <p className="text-sm leading-6 text-ink-muted">A short note is enough to start.</p>
            </div>
            <Button onClick={onAddPage}>Add page</Button>
          </div>
        </article>
        <article aria-hidden="true" className="book-page hidden bg-surface-muted/60 md:block" />
      </section>
    );
  }

  const panels = pages.length % 2 === 0 ? pages : [...pages, null];

  return (
    <section className="book-spread" aria-label="Diary pages">
      {panels.map((page, index) =>
        page ? (
          <article className="book-page" key={page.id}>
            <p className="mb-4 text-sm font-medium text-ink-muted">{formatPageDate(page.created_at)}</p>
            <MarkdownContent content={page.content} />
          </article>
        ) : (
          <article aria-hidden="true" className="book-page hidden bg-surface-muted/60 md:block" key={`blank-${index}`} />
        )
      )}
    </section>
  );
}
