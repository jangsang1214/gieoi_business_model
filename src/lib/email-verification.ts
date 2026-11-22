/** UI-level safety checks; Supabase remains authoritative for OTP expiry and rate limits. */
export const CONFIRMATION_RESEND_INTERVAL_MS = 60_000;

export function isSixDigitEmailCode(value: string): boolean {
  return /^\d{6}$/.test(value);
}

export function canResendConfirmation(lastRequestAt: number, now: number): boolean {
  return lastRequestAt <= 0 || now - lastRequestAt >= CONFIRMATION_RESEND_INTERVAL_MS;
}
