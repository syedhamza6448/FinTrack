export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function toISO(dateStr: string): string {
  return new Date(dateStr).toISOString();
}

export function fromISO(iso: string): string {
  return iso.split('T')[0];
}

