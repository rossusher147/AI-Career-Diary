export function formatPageDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}
