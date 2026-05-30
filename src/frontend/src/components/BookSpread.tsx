import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PageRead } from "../api/types";
import { formatPageDate } from "../utils/dates";
import { Button } from "./Button";
import { MarkdownContent } from "./MarkdownContent";

interface BookSpreadProps {
  pages: PageRead[];
  onAddPage: () => void;
}

type PageSide = "left" | "right";
type TurnDirection = "previous" | "next";

interface TurnState {
  direction: TurnDirection;
  outgoingPage: PageRead | null;
  outgoingPageNumber: number;
}

const PAGE_TURN_DURATION_MS = 680;

export function BookSpread({ onAddPage, pages }: BookSpreadProps) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [turn, setTurn] = useState<TurnState | null>(null);
  const spreadCount = Math.max(1, Math.ceil(pages.length / 2));
  const activeSpreadIndex = Math.min(spreadIndex, spreadCount - 1);

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
  const lastPageNumber = Math.min(firstPageNumber + 1, pages.length);
  const pageRangeLabel =
    firstPageNumber === lastPageNumber
      ? `Page ${firstPageNumber} of ${pages.length}`
      : `Pages ${firstPageNumber}-${lastPageNumber} of ${pages.length}`;
  const hasPreviousSpread = activeSpreadIndex > 0;
  const hasNextSpread = activeSpreadIndex < spreadCount - 1;

  function turnPage(direction: TurnDirection) {
    if (turn) {
      return;
    }

    const targetIndex = direction === "next" ? activeSpreadIndex + 1 : activeSpreadIndex - 1;

    if (targetIndex < 0 || targetIndex >= spreadCount) {
      return;
    }

    const outgoingPageIndex = direction === "next" ? activeSpreadIndex * 2 + 1 : activeSpreadIndex * 2;

    setTurn({
      direction,
      outgoingPage: pages[outgoingPageIndex] ?? null,
      outgoingPageNumber: outgoingPageIndex + 1
    });
    setSpreadIndex(targetIndex);
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
      <div className="book-reader__controls">
        <Button
          aria-label="Previous page spread"
          className="book-reader__nav-button"
          disabled={!hasPreviousSpread || Boolean(turn)}
          onClick={() => turnPage("previous")}
          variant="secondary"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          Previous
        </Button>
        <p aria-live="polite" className="book-reader__counter">
          {pageRangeLabel}
        </p>
        <Button
          aria-label="Next page spread"
          className="book-reader__nav-button"
          disabled={!hasNextSpread || Boolean(turn)}
          onClick={() => turnPage("next")}
          variant="secondary"
        >
          Next
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>

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
        <BookPage page={leftPage} pageNumber={firstPageNumber} side="left" />
        <BookPage page={rightPage} pageNumber={firstPageNumber + 1} side="right" />
        {turn ? <TurningPage turn={turn} /> : null}
      </section>
    </div>
  );
}

function BookPage({ page, pageNumber, side }: { page: PageRead | null; pageNumber: number; side: PageSide }) {
  const isBlank = !page;

  return (
    <article
      aria-hidden={isBlank ? "true" : undefined}
      className={["book-page", `book-page--${side}`, isBlank ? "book-page--blank" : ""].filter(Boolean).join(" ")}
    >
      {page ? (
        <>
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
