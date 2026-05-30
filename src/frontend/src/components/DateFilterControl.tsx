import { CalendarDays, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

export type DateFilterValue =
  | {
      mode: "day";
      date: string;
    }
  | {
      mode: "range";
      startDate?: string;
      endDate?: string;
    };

type FilterMode = DateFilterValue["mode"];

interface DateFilterControlProps {
  value: DateFilterValue | null;
  onChange: (value: DateFilterValue | null) => void;
}

interface DraftDateFilter {
  mode: FilterMode;
  date: string;
  startDate: string;
  endDate: string;
}

const emptyDraft: DraftDateFilter = {
  mode: "day",
  date: "",
  startDate: "",
  endDate: ""
};

export function DateFilterControl({ onChange, value }: DateFilterControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<DraftDateFilter>(() => draftFromValue(value));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isActive = Boolean(value);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraft(draftFromValue(value));
  }, [isOpen, value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const canApply =
    draft.mode === "day" ? draft.date.length > 0 : draft.startDate.length > 0 || draft.endDate.length > 0;

  function selectMode(mode: FilterMode) {
    setDraft((currentDraft) => {
      if (mode === currentDraft.mode) {
        return currentDraft;
      }

      if (mode === "range") {
        return {
          ...currentDraft,
          mode,
          startDate: currentDraft.date || currentDraft.startDate,
          endDate: ""
        };
      }

      return {
        ...currentDraft,
        mode,
        date: currentDraft.date || currentDraft.startDate || currentDraft.endDate
      };
    });
  }

  function applyFilter() {
    if (!canApply) {
      return;
    }

    if (draft.mode === "day") {
      onChange({ mode: "day", date: draft.date });
      setIsOpen(false);
      return;
    }

    let startDate = draft.startDate || undefined;
    let endDate = draft.endDate || undefined;

    if (startDate && endDate && startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }

    onChange({ mode: "range", startDate, endDate });
    setIsOpen(false);
  }

  function clearFilter() {
    onChange(null);
    setDraft(emptyDraft);
    setIsOpen(false);
  }

  return (
    <div className="date-filter" ref={wrapperRef}>
      <div className="date-filter__buttons">
        <Button
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className={["date-filter__trigger", isActive ? "date-filter__trigger--active" : ""].filter(Boolean).join(" ")}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          variant="secondary"
        >
          <CalendarDays aria-hidden="true" className="h-4 w-4" />
          <span className="date-filter__trigger-label">{value ? formatDateFilterValue(value) : "Filter dates"}</span>
          <ChevronDown aria-hidden="true" className="h-4 w-4" />
        </Button>
        {isActive ? (
          <Button aria-label="Clear date filter" className="date-filter__clear" onClick={clearFilter} variant="ghost">
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {isOpen ? (
        <section aria-label="Filter pages by date" className="date-filter__panel" role="dialog">
          <div aria-label="Date filter type" className="date-filter__mode" role="group">
            <button
              className={["date-filter__mode-button", draft.mode === "day" ? "date-filter__mode-button--active" : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => selectMode("day")}
              type="button"
            >
              Day
            </button>
            <button
              className={["date-filter__mode-button", draft.mode === "range" ? "date-filter__mode-button--active" : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => selectMode("range")}
              type="button"
            >
              Range
            </button>
          </div>

          {draft.mode === "day" ? (
            <label className="date-filter__field">
              <span>Date</span>
              <input
                className="date-filter__input"
                onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, date: event.target.value }))}
                type="date"
                value={draft.date}
              />
            </label>
          ) : (
            <div className="date-filter__range">
              <label className="date-filter__field">
                <span>Start</span>
                <input
                  className="date-filter__input"
                  onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, startDate: event.target.value }))}
                  type="date"
                  value={draft.startDate}
                />
              </label>
              <label className="date-filter__field">
                <span>End</span>
                <input
                  className="date-filter__input"
                  onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, endDate: event.target.value }))}
                  type="date"
                  value={draft.endDate}
                />
              </label>
            </div>
          )}

          <div className="date-filter__actions">
            <Button onClick={clearFilter} variant="ghost">
              Clear
            </Button>
            <Button disabled={!canApply} onClick={applyFilter}>
              Apply
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function formatDateFilterValue(value: DateFilterValue): string {
  if (value.mode === "day") {
    return formatInputDate(value.date);
  }

  if (value.startDate && value.endDate) {
    if (value.startDate === value.endDate) {
      return formatInputDate(value.startDate);
    }

    return `${formatInputDate(value.startDate)} to ${formatInputDate(value.endDate)}`;
  }

  if (value.startDate) {
    return `From ${formatInputDate(value.startDate)}`;
  }

  return `Until ${formatInputDate(value.endDate ?? "")}`;
}

function draftFromValue(value: DateFilterValue | null): DraftDateFilter {
  if (!value) {
    return emptyDraft;
  }

  if (value.mode === "day") {
    return {
      ...emptyDraft,
      date: value.date
    };
  }

  return {
    mode: "range",
    date: value.startDate ?? value.endDate ?? "",
    startDate: value.startDate ?? "",
    endDate: value.endDate ?? ""
  };
}

function formatInputDate(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}
