import { HttpErrorResponse } from '@angular/common/http';

/** Convert API and network failures to a safe, actionable message. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return 'Cannot connect to the server. Check your connection and try again.';
  const body: unknown = error.error;
  if (body && typeof body === 'object') {
    const data = body as Record<string, unknown>;
    if (typeof data['message'] === 'string' && data['message'].trim()) return data['message'];
    if (typeof data['detail'] === 'string' && data['detail'].trim()) return data['detail'];
    if (data['errors'] && typeof data['errors'] === 'object') {
      const messages = Object.values(data['errors'] as Record<string, unknown>).filter((x): x is string => typeof x === 'string');
      if (messages.length) return messages.slice(0, 3).join(' ');
    }
  }
  if (error.status === 409) return 'This record conflicts with existing data. Check for duplicate names or codes.';
  if (error.status === 404) return 'This record no longer exists. Refresh the list and try again.';
  if (error.status >= 500) return 'The server encountered a problem. Please try again shortly.';
  return fallback;
}
