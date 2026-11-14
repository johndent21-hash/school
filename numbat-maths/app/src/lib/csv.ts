type Saver = { save: (r: { filename: string; data: string }) => Promise<unknown> }
type ClaudeHost = { use?: (name: string) => Promise<unknown> }

/** The claude.ai artifact viewer's file saver, when the page runs inside it (the preview copy); null elsewhere.
 *  The viewer blocks ordinary download links, so the preview offers files through it instead. */
let saver: Promise<Saver | null> | undefined
function artifactSaver(): Promise<Saver | null> {
  if (saver) return saver
  const host = typeof window === 'undefined' ? undefined : (window as unknown as { claude?: ClaudeHost }).claude
  saver = host?.use ? host.use('downloads').then((d) => (d as Saver | null) ?? null, () => null) : Promise.resolve(null)
  return saver
}

function linkDownload(filename: string, text: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** True when files can be offered through the artifact viewer (the preview copy). */
export async function canSaveInViewer(): Promise<boolean> {
  return (await artifactSaver()) !== null
}

/** Saves a text file (e.g. a printable HTML page): through the artifact viewer when the page runs in it, else a link. */
export async function saveText(filename: string, text: string, type: string) {
  const s = await artifactSaver()
  if (!s) return linkDownload(filename, text, type)
  try {
    await s.save({ filename, data: text })
  } catch {
    // declined or unavailable
  }
}

/** Saves rows as a CSV file (opens in Excel or Google Sheets). */
export async function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = '﻿' + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const s = await artifactSaver()
  if (!s) return linkDownload(filename, csv)
  try {
    await s.save({ filename, data: csv })
  } catch {
    // the viewer declined, or saving is switched off here: nothing more to do
  }
}
