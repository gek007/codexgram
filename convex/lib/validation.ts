import { fail } from "./auth";
export function handle(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,24}$/.test(normalized)) return fail("VALIDATION");
  return normalized;
}
export function text(value: string, max: number, required = false) {
  const cleaned = value.trim();
  if (cleaned.length > max || (required && !cleaned)) return fail("VALIDATION");
  return cleaned;
}
export function accent(value: string) {
  if (!/^#[0-9a-f]{6}$/i.test(value)) return fail("VALIDATION");
  return value;
}
