// "Read aloud" for lessons and worked examples, using the browser's built-in voices.

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

/** Turns question HTML into words a speech voice reads naturally. */
export function speakable(html: string): string {
  if (typeof document === 'undefined') return html.replace(/<[^>]*>/g, ' ')
  const div = document.createElement('div')
  div.innerHTML = html
  div.querySelectorAll('svg, table').forEach((e) => e.remove())
  div.querySelectorAll('.frac').forEach((e) => e.replaceWith(` ${e.getAttribute('aria-label') ?? e.textContent ?? ''} `))
  div.querySelectorAll('.sqrt').forEach((e) => e.replaceWith(` the square root of ${e.querySelector('.rad')?.textContent ?? ''} `))
  div.querySelectorAll('sup').forEach((e) => {
    const t = (e.textContent ?? '').trim()
    e.replaceWith(t === '2' ? ' squared ' : t === '3' ? ' cubed ' : ` to the power of ${t} `)
  })
  let t = div.textContent ?? ''
  t = t
    .replace(/²/g, ' squared ')
    .replace(/³/g, ' cubed ')
    .replace(/−/g, ' minus ')
    .replace(/×/g, ' times ')
    .replace(/÷/g, ' divided by ')
    .replace(/≈/g, ' is about ')
    .replace(/≤/g, ' is less than or equal to ')
    .replace(/≥/g, ' is greater than or equal to ')
    .replace(/=/g, ' equals ')
    .replace(/</g, ' is less than ')
    .replace(/>/g, ' is greater than ')
    .replace(/°/g, ' degrees ')
    .replace(/π/g, ' pi ')
    .replace(/∠/g, ' angle ')
    .replace(/△/g, ' triangle ')
    .replace(/%/g, ' percent ')
  return t.replace(/\s+/g, ' ').trim()
}

export function speak(html: string, onEnd?: () => void): boolean {
  if (!canSpeak()) return false
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(speakable(html))
  u.lang = 'en-AU'
  u.rate = 0.95
  const voices = synth.getVoices()
  const voice = voices.find((v) => v.lang === 'en-AU') ?? voices.find((v) => v.lang.startsWith('en-GB')) ?? voices.find((v) => v.lang.startsWith('en'))
  if (voice) u.voice = voice
  if (onEnd) {
    u.onend = onEnd
    u.onerror = onEnd
  }
  synth.speak(u)
  return true
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel()
}
