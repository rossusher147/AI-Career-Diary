import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  helper?: string;
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | null;
  helper?: string;
}

export function InputField({ error, helper, id, label, className = "", ...props }: InputFieldProps) {
  const fieldId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const descriptionId = `${fieldId}-description`;

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
          className
        ].join(" ")}
        id={fieldId}
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

export function TextareaField({ error, helper, id, label, className = "", ...props }: TextareaFieldProps) {
  const fieldId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const descriptionId = `${fieldId}-description`;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink" htmlFor={fieldId}>
        {label}
      </label>
      <textarea
        aria-describedby={helper || error ? descriptionId : undefined}
        aria-invalid={Boolean(error)}
        className={[
          "min-h-[18rem] w-full resize-y rounded-md border border-ink/20 bg-white px-3 py-3 text-base leading-7 text-ink shadow-sm",
          "placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
          className
        ].join(" ")}
        id={fieldId}
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
