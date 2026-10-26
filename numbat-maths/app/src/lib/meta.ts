import siteMetadata from '../metadata.json'
import { canonicalUrl } from './canonical-url'

type PageMeta = { title: string; description: string; noindex?: boolean }

/** Head tags for a route, read from src/metadata.json. */
export function pageHead(path: string) {
  const all = siteMetadata as Record<string, PageMeta>
  const m = all[path] ?? all.default
  const canonical = canonicalUrl(path)
  return {
    meta: [
      { title: m.title },
      { name: 'description', content: m.description },
      ...(m.noindex ? [{ name: 'robots', content: 'noindex' }] : []),
    ],
    links: canonical ? [{ rel: 'canonical', href: canonical }] : [],
  }
}
