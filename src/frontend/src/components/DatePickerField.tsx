import type { ChangeEvent } from "react";

interface DatePickerFieldProps {
  label: string;
  error?: string | null;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  id?: string;
  className?: string;
}

export function DatePickerField({ error, helper, id, label, className = "", value, onChange, name, ...props }: DatePickerFieldProps) {
  const fieldId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");
  const descriptionId = `${fieldId}-description`;

  // Get today's date in ISO format (YYYY-MM-DD) for max attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink" htmlFor={fieldId}>
        {label}
      </label>
      <input
        aria-describedby={helper || error ? descriptionId : undefined}
        aria-invalid={Boolean(error)}
        className={[
          "min-h-11 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink shadow-sm",
          "placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
          className ?? ""
        ].join(" ")}
        id={fieldId}
        max={today}
        name={name}
        type="date"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        {...props}
      />
      {helper || error ? (
        <p className={error ? "text-sm text-red-700" : "text-sm text-ink-muted"} id={descriptionId}>
          {error ?? helper}
        </p>
      ) : null}
    </div>
  );
}
