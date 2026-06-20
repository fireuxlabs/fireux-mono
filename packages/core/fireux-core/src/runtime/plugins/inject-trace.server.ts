import { defineNuxtPlugin } from '#imports'

/**
 * inject-trace.server
 * Server-side tracer for Vue/Nuxt composable misuse that results in warnings/logs.
 * Many of these warnings are emitted on the client, but Nuxt/Nitro may also
 * log related messages server-side. This tracer wraps console.warn/error on the
 * server and prints filtered, actionable frames when we detect the signature messages.
 */
export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV === 'production') return
  if (process.env.FIREUX_INJECT_TRACE !== '1') return

  const g = globalThis as unknown as {
    __INJECT_TRACE_SERVER_PATCHED__?: boolean
  }
  if (g.__INJECT_TRACE_SERVER_PATCHED__) return

  console.info('[InjectTrace:server] running')

  const origWarn = console.warn.bind(console)
  const origError = console.error.bind(console)

  const handle = (_level: 'warn' | 'error', args: unknown[]) => {
    try {
      const text = args.map((a) => String(a)).join(' ')
      const isInjectWarn = text.includes(
        'inject() can only be used inside setup'
      )
      const isUseNuxtAppWarn = text.includes(
        'A composable that requires access to the Nuxt instance'
      )
      if (isInjectWarn || isUseNuxtAppWarn) {
        const err = new Error(String(args[0] ?? ''))
        const stack = (err.stack || '').split('\n')
        const filtered = stack
          .filter(
            (line) => line.includes('/projects/') || line.includes('/packages/')
          )
          .filter((line) => !line.includes('node_modules'))
        const hint = filtered[0]?.trim() || '(no userland frame)'
        console.log(
          `[InjectTrace:server] ${
            isInjectWarn ? 'inject()' : 'nuxt composable'
          } misuse\n` +
            `Message: ${text}\n` +
            `Hint: ${hint}\n` +
            (filtered.length > 1
              ? `Stack:\n${filtered.slice(0, 8).join('\n')}`
              : '')
        )
      }
    } catch {
      // ignore
    }
  }

  console.warn = (...args: unknown[]) => {
    handle('warn', args)
    origWarn(...(args as any[]))
  }
  console.error = (...args: unknown[]) => {
    handle('error', args)
    origError(...(args as any[]))
  }

  g.__INJECT_TRACE_SERVER_PATCHED__ = true
})
