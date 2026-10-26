/**
 * True only in the stand-alone preview copy of the site, which runs without the server:
 * lessons, practice and tests work there, but student and teacher log-ins are switched off.
 */
export const PREVIEW_ONLY = import.meta.env.VITE_PREVIEW_ONLY === '1'
