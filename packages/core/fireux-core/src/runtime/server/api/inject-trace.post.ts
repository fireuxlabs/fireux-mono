import {
  defineEventHandler,
  readBody,
  getHeader,
  getRequestURL,
  type H3Event,
} from 'h3'

export default defineEventHandler(async (event: H3Event) => {
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

    console.log('\n[InjectTrace:server] ← client forwarded')

    console.log('Kind:', kind)

    console.log('Message:', message)

    console.log('Component:', component)

    console.log('Hint:', hint)
    if (stack.length) {
      console.log('Stack (first frames):\n' + stack.slice(0, 12).join('\n'))
    }

    console.log('UA:', ua)

    console.log('Href:', href)

    return { ok: true }
  } catch (e: any) {
    console.error('[InjectTrace:server] handler error:', e?.message || e)
    return { ok: false }
  }
})
