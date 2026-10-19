import "server-only";

/** Bloqueia requisições de outros sites (CSRF) em rotas de API que alteram dados. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const allowed = new Set<string>();
  if (process.env.APP_URL) allowed.add(new URL(process.env.APP_URL).origin);
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") ?? "http";
    allowed.add(`${proto}://${host}`);
    allowed.add(`https://${host}`);
  }
  return allowed.has(origin);
}
