export function logDevError(label: string, error: unknown) {
  if (process.env.NODE_ENV === "production") return;

  // eslint-disable-next-line no-console
  console.error(label, error);
}
