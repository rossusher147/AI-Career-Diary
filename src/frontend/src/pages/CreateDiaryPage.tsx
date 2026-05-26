import { Save } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { InputField } from "../components/Field";
import { ErrorBlock } from "../components/Feedback";
import { useDiaryApi } from "../hooks";

export function CreateDiaryPage() {
  const diaryApi = useDiaryApi();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    setFieldError(null);
    setFormError(null);

    if (!trimmedName) {
      setFieldError("Enter a diary name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const diary = await diaryApi.createDiary({ name: trimmedName });
      navigate(`/diaries/${diary.id}`, { state: { diaryName: diary.name } });
    } catch {
      setFormError("We couldn't create your diary. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-lg bg-surface-raised p-6 shadow-soft sm:p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-ink">Create diary</h1>
            <p className="text-sm leading-6 text-ink-muted">Name the place where you will keep your work notes.</p>
          </div>

          {formError ? <ErrorBlock message={formError} title="Diary could not be created" /> : null}

          <InputField
            autoComplete="off"
            error={fieldError}
            label="Diary name"
            name="diary-name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Work Diary"
            value={name}
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button onClick={() => navigate("/diaries")} type="button" variant="secondary">
              Cancel
            </Button>
            <Button isLoading={isSubmitting} type="submit">
              <Save aria-hidden="true" className="h-4 w-4" />
              Create diary
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
