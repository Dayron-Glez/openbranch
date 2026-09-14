const DEL = 127
const FIRST_PRINTABLE = 32

/** True when the string carries a control character — a smuggled newline or NUL. */
const hasControlCharacter = (value: string): boolean => {
  for (const character of value) {
    const code = character.codePointAt(0)
    if (code !== undefined && (code < FIRST_PRINTABLE || code === DEL)) return true
  }
  return false
}

/**
 * `?next=` is attacker-controllable and ends up both in a `<Link href>` and in
 * the OAuth `redirectTo`, so it is validated everywhere it is read rather than
 * trusted from whoever passed it along.
 *
 * The callback concatenated it straight onto `origin`, which let
 * `next=//evil.com` resolve to `https://site.com//evil.com` — a protocol-relative
 * URL pointing off-origin. Browsers also normalise a backslash to a slash in the
 * authority position, so `/\evil.com` is the same trick spelled differently.
 */
export const safeNextPath = (raw: string | null | undefined, fallback: string): string => {
  if (raw === undefined || raw === null || raw.length === 0) return fallback
  // Must be rooted, so an absolute URL ("https://…") never survives.
  if (!raw.startsWith("/")) return fallback
  // A second slash or a backslash in position 1 makes it an authority, not a path.
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback
  if (hasControlCharacter(raw)) return fallback
  return raw
}
