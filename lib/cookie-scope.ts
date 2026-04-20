// Cookie-scope helper. In production we want the session + streak + language
// cookies to work across every *.hellodilly.com subdomain — skills,
// app, marketing — so the Dilly ecosystem feels like one product. In dev
// (localhost) the browser rejects explicit domains, so we just omit it.
//
// Controlled by SKILLS_COOKIE_DOMAIN env (default ".hellodilly.com" in prod).

const PROD = process.env.NODE_ENV === "production";
const COOKIE_DOMAIN = process.env.SKILLS_COOKIE_DOMAIN || ".hellodilly.com";

export type CookieOptions = {
  maxAge?: number;
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  secure?: boolean;
  domain?: string;
};

/**
 * Returns cookie options that share across *.hellodilly.com in production.
 * Pass any overrides (maxAge, httpOnly) as the argument.
 */
export function sharedCookie(extra: CookieOptions = {}): CookieOptions {
  return {
    path: "/",
    sameSite: "lax",
    secure: PROD,
    ...(PROD ? { domain: COOKIE_DOMAIN } : {}),
    ...extra,
  };
}
