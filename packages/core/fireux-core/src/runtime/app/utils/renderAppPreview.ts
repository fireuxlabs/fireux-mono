import type { App } from '../models/app.model'

const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)

/** Minimal standalone HTML generated solely from saved App presentation. */
export function renderAppPreview(app: Pick<App, 'name' | 'description'>): string {
  const name = escape(app.name)
  const description = escape(app.description || '')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name}</title><style>body{margin:0;background:#f5f2eb;color:#222;font:18px/1.6 system-ui,sans-serif}main{max-width:780px;margin:auto;padding:12vh 8vw}h1{font-size:clamp(40px,8vw,88px);line-height:1.05;letter-spacing:-.05em}p{max-width:42em;white-space:pre-wrap}hr{border:0;border-top:1px solid #ccc;margin:2em 0}</style></head><body><main><h1>${name}</h1><hr><p>${description}</p></main></body></html>`
}
