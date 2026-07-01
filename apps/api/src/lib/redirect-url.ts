export function withDefaultCallbackURL(url: string, fallbackCallbackURL: string): string {
  const parsed = new URL(url);
  const current = parsed.searchParams.get("callbackURL");
  if (!current || current === "/") {
    parsed.searchParams.set("callbackURL", fallbackCallbackURL);
  }
  return parsed.toString();
}
