import { defineEventHandler, readBody, getHeader, getRequestURL } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const ua = body?.ua || getHeader(event, 'user-agent') || 'n/a'
    const href = body?.href || getRequestURL(event).search || ''
    const kind = body?.kind || body?.type || 'unknown'
    const message = body?.message || ''
    const hint = body?.hint || ''
    const stack: string[] = Array.isArray(body?.stack) ? body.stack : []
    const component = body?.component || {}

    // Server-side log with clear block formatting
    // eslint-disable-next-line no-console
    console.log('\n[InjectTrace:server] ← client forwarded')
    // eslint-disable-next-line no-console
    console.log('Kind:', kind)
    // eslint-disable-next-line no-console
    console.log('Message:', message)
    // eslint-disable-next-line no-console
    console.log('Component:', component)
    // eslint-disable-next-line no-console
    console.log('Hint:', hint)
    if (stack.length) {
      // eslint-disable-next-line no-console
      console.log('Stack (first frames):\n' + stack.slice(0, 12).join('\n'))
    }
    // eslint-disable-next-line no-console
    console.log('UA:', ua)
    // eslint-disable-next-line no-console
    console.log('Href:', href)

    return { ok: true }
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('[InjectTrace:server] handler error:', e?.message || e)
    return { ok: false }
  }
})
