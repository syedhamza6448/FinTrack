export function extractError(err: any): string {
  if (err?.error?.message) return err.error.message;
  if (err?.error?.errors) {
    try {
      return Object.values(err.error.errors as Record<string, string[]>)
        .flat()
        .join('. ');
    } catch {
      // fall through to generic message
    }
  }
  if (err?.status === 401) return 'Your session has expired. Please log in again.';
  if (err?.status === 404) return 'Item not found.';
  return 'Something went wrong. Please try again.';
}

