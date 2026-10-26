/** Class codes are 6 capital letters and digits; this tidies what someone types. */
export function cleanCode(s: string): string {
  return s
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6)
}
