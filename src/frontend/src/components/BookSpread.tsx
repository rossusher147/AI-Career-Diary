import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PageRead } from "../api/types";
import { formatPageDate } from "../utils/dates";
import { Button } from "./Button";
import { MarkdownContent } from "./MarkdownContent";

interface BookSpreadProps {
  pages: PageRead[];
  onAddPage: () => void;
  onEditPage?: (page: PageRead) => void;
}

type PageSide = "left" | "right";
type TurnDirection = "previous" | "next";
type GoToSpreadOptions = {
  animate?: boolean;
};

interface TurnState {
  direction: TurnDirection;
  outgoingPage: PageRead | null;
  outgoingPageNumber: number;
}

const PAGE_TURN_DURATION_MS = 260;

export function BookSpread({ onAddPage, onEditPage, pages }: BookSpreadProps) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [turn, setTurn] = useState<TurnState | null>(null);
  const spreadCount = Math.max(1, Math.ceil(pages.length / 2));
  const activeSpreadIndex = Math.min(spreadIndex, spreadCount - 1);

  useEffect(() => {
    setSpreadIndex(0);
    setTurn(null);
  }, [pages]);

  useEffect(() => {
    setSpreadIndex((currentIndex) => Math.min(currentIndex, spreadCount - 1));
  }, [spreadCount]);

  useEffect(() => {
    if (!turn) {
      return;
    }

    const timeoutId = window.setTimeout(() => setTurn(null), PAGE_TURN_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [turn]);

  const { leftPage, rightPage } = useMemo(() => {
    const startIndex = activeSpreadIndex * 2;

    return {
      leftPage: pages[startIndex] ?? null,
      rightPage: pages[startIndex + 1] ?? null
    };
  }, [activeSpreadIndex, pages]);

  const firstPageNumber = activeSpreadIndex * 2 + 1;
  const hasPreviousSpread = activeSpreadIndex > 0;
  const hasNextSpread = activeSpreadIndex < spreadCount - 1;

  function goToSpread(targetIndex: number, options: GoToSpreadOptions = {}) {
    if (turn) {
      return;
    }

    if (targetIndex < 0 || targetIndex >= spreadCount) {
      return;
    }

    if (targetIndex === activeSpreadIndex) {
      return;
    }

    const direction: TurnDirection = targetIndex > activeSpreadIndex ? "next" : "previous";

    if (options.animate && Math.abs(targetIndex - activeSpreadIndex) === 1) {
      const outgoingPageIndex = direction === "next" ? activeSpreadIndex * 2 + 1 : activeSpreadIndex * 2;

      setTurn({
        direction,
        outgoingPage: pages[outgoingPageIndex] ?? null,
        outgoingPageNumber: outgoingPageIndex + 1
      });
    } else {
      setTurn(null);
    }

    setSpreadIndex(targetIndex);
  }

  function goToSelectedSpread(spreadNumber: number) {
    if (turn || !Number.isInteger(spreadNumber)) {
      return;
    }

    const targetSpreadNumber = Math.min(Math.max(spreadNumber, 1), spreadCount);
    goToSpread(targetSpreadNumber - 1);
  }

  if (pages.length === 0) {
    return (
      <section className="book-spread" aria-label="Diary pages">
        <span aria-hidden="true" className="book-spread__gutter" />
        <article className="book-page book-page--left flex flex-col justify-center">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Your first page is ready</h2>
              <p className="text-sm leading-6 text-ink-muted">A short note is enough to start.</p>
            </div>
            <Button onClick={onAddPage}>Add page</Button>
          </div>
        </article>
        <article aria-hidden="true" className="book-page book-page--right book-page--blank" />
      </section>
    );
  }

  return (
    <div className="book-reader">
      <section
        aria-label="Diary pages"
        className={[
          "book-spread",
          turn ? "book-spread--turning" : "",
          turn ? `book-spread--turning-${turn.direction}` : ""
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span aria-hidden="true" className="book-spread__gutter" />
        <BookPage page={leftPage} pageNumber={firstPageNumber} side="left" onEdit={onEditPage} />
        <BookPage page={rightPage} pageNumber={firstPageNumber + 1} side="right" onEdit={onEditPage} />
        {turn ? <TurningPage turn={turn} /> : null}
      </section>

      <nav aria-label="Diary page spread pagination" className="book-reader__controls">
        <Button
          aria-label="Go to first page"
          className="book-reader__nav-button"
          disabled={!hasPreviousSpread || Boolean(turn)}
          onClick={() => goToSpread(0)}
          variant="secondary"
        >
          <ChevronsLeft aria-hidden="true" className="h-4 w-4" />
          First
        </Button>
        <Button
          aria-label="Go back one page spread"
          className="book-reader__nav-button"
          disabled={!hasPreviousSpread || Boolean(turn)}
          onClick={() => goToSpread(activeSpreadIndex - 1, { animate: true })}
          variant="secondary"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          Back
        </Button>
        <label className="book-reader__page-picker">
          <span className="book-reader__page-label">Page</span>
          <select
            aria-label="Select page range"
            className="book-reader__page-select"
            disabled={Boolean(turn)}
            onChange={(event) => goToSelectedSpread(Number(event.target.value))}
            value={activeSpreadIndex + 1}
          >
            {Array.from({ length: spreadCount }, (_, index) => {
              const spreadNumber = index + 1;
              const optionFirstPageNumber = index * 2 + 1;
              const optionLastPageNumber = Math.min(optionFirstPageNumber + 1, pages.length);
              const optionLabel =
                optionFirstPageNumber === optionLastPageNumber
                  ? String(optionFirstPageNumber)
                  : `${optionFirstPageNumber}-${optionLastPageNumber}`;

              return (
                <option key={spreadNumber} value={spreadNumber}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        </label>
        <Button
          aria-label="Go to next page spread"
          className="book-reader__nav-button"
          disabled={!hasNextSpread || Boolean(turn)}
          onClick={() => goToSpread(activeSpreadIndex + 1, { animate: true })}
          variant="secondary"
        >
          Next
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Go to last page"
          className="book-reader__nav-button"
          disabled={!hasNextSpread || Boolean(turn)}
          onClick={() => goToSpread(spreadCount - 1)}
          variant="secondary"
        >
          Last
          <ChevronsRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
}

function BookPage({ page, pageNumber, side, onEdit }: { page: PageRead | null; pageNumber: number; side: PageSide; onEdit?: (page: PageRead) => void }) {
  const isBlank = !page;

  return (
    <article
      aria-hidden={isBlank ? "true" : undefined}
      className={["book-page", `book-page--${side}`, isBlank ? "book-page--blank" : ""].filter(Boolean).join(" ")}
    >
      {page ? (
        <>
          <button
            aria-label="Edit this page"
            className="absolute top-3 right-3 p-1.5 rounded hover:bg-accent-soft text-ink-muted hover:text-accent transition-colors"
            onClick={() => onEdit?.(page)}
            title="Edit page"
          >
            <Pen className="h-4 w-4" />
          </button>
          <p className="book-page__date">{formatPageDate(page.created_at)}</p>
          <div className="book-page__body">
            <MarkdownContent content={page.content} />
          </div>
          <span className="book-page__folio">Page {pageNumber}</span>
        </>
      ) : null}
    </article>
  );
}

function TurningPage({ turn }: { turn: TurnState }) {
  return (
    <article
      aria-hidden="true"
      className={[
        "book-turn-sheet",
        `book-turn-sheet--${turn.direction}`,
        turn.outgoingPage ? "" : "book-turn-sheet--blank"
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {turn.outgoingPage ? (
        <>
          <p className="book-page__date">{formatPageDate(turn.outgoingPage.created_at)}</p>
          <div className="book-turn-sheet__body">
            <MarkdownContent content={turn.outgoingPage.content} />
          </div>
          <span className="book-page__folio">Page {turn.outgoingPageNumber}</span>
        </>
      ) : null}
    </article>
  );
}
