// Server-only language helper. Language switching is temporarily disabled -
// every request is treated as English. The i18n dictionary and cookie wiring
// are kept intact so we can re-enable the picker later without a migration.

import { DEFAULT_LANG, LangCode, normalizeLang } from "./i18n";

export const LANG_COOKIE = "skilllab_lang";

export async function getLang(): Promise<LangCode> {
  return DEFAULT_LANG;
}

export function langFromSearchParams(raw: unknown): LangCode | null {
  if (typeof raw !== "string") return null;
  return normalizeLang(raw);
}
