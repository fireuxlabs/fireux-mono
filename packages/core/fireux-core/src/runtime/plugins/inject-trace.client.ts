import { defineNuxtPlugin } from 'nuxt/app'

/**
 * inject-trace.client
 * Dev helper: intercept Vue warns for inject()/Nuxt composables used outside setup
 * and print a focused report with component file and filtered stack lines.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (process.env.NODE_ENV === 'production') return

  // Minimal startup marker (kept concise to avoid client noise)
  // eslint-disable-next-line no-console
  console.info(
    '%c[InjectTrace]%c running',
    'color:#ef4444;font-weight:bold',
    'color:inherit'
  )

  const config = nuxtApp.vueApp.config
  const originalWarnHandler = config.warnHandler

  // eslint-disable-next-line no-console
  console.info(
    '%c[InjectTrace]%c warnHandler attached',
    'color:#ef4444;font-weight:bold',
    'color:inherit'
  )

  function safeToText(input: unknown): string {
    try {
      if (typeof input === 'string') return input
      if (input instanceof Error) return input.message || String(input)
      if (input == null) return ''
      const t = typeof input
      if (t === 'number' || t === 'boolean' || t === 'bigint')
        return `${input as number | boolean | bigint}`
      if (t === 'symbol')
        return (input as symbol).description ?? (input as symbol).toString()
      if (t === 'object') return JSON.stringify(input)
      return `${input as any}`
    } catch {
      try {
        return `${input as any}`
      } catch {
        return ''
      }
    }
  }

  function forwardToServer(payload: Record<string, unknown>) {
    try {
      const url = '/api/inject-trace'
      const body = JSON.stringify({
        ...payload,
        ts: Date.now(),
        href: typeof window !== 'undefined' ? window.location.href : undefined,
        ua: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      })
      // Prefer sendBeacon to avoid blocking and to survive unloads
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        const blob = new Blob([body], { type: 'application/json' })
        ;(navigator as any).sendBeacon(url, blob)
        return
      }
      // Fallback to fetch with keepalive
      void fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    } catch {
      // ignore
    }
  }

  config.warnHandler = (message, instance, trace) => {
    const msg = String(message ?? '')
    const isInjectWarn = msg.includes('inject() can only be used inside setup')
    const isUseNuxtAppWarn = msg.includes(
      'A composable that requires access to the Nuxt instance'
    )

    if (isInjectWarn || isUseNuxtAppWarn) {
      const comp = (instance ?? {}) as {
        type?: { __file?: string; name?: string }
        __file?: string
        name?: string
      }
      const file = comp?.type?.__file ?? comp?.__file ?? 'unknown-file'
      const name = comp?.type?.name ?? comp?.name ?? 'anonymous-component'

      const err = new Error(msg)
      const stackLines = (err.stack || '').split('\n')
      const filtered = stackLines
        .filter(
          (line) => line.includes('/projects/') || line.includes('/packages/')
        )
        .filter((line) => !line.includes('node_modules'))
      const hint =
        filtered[0]?.trim() ||
        (trace ? String(trace).split('\n')[0] : '') ||
        '(no userland frame)'

      // Forward to server (no client console noise)
      forwardToServer({
        source: 'client-warnHandler',
        kind: isInjectWarn ? 'inject()' : 'nuxt-composable',
        message: msg,
        component: { name, file },
        hint,
        stack: filtered.slice(0, 12),
      })
    }

    if (typeof originalWarnHandler === 'function') {
      originalWarnHandler(message as any, instance as any, trace as any)
    }
  }

  // Fallback: some warnings may bypass warnHandler or another plugin may override it later.
  // Patch console.warn in dev to catch the signature strings and forward them to server.
  const g = globalThis as unknown as {
    __INJECT_TRACE_CONSOLE_PATCHED__?: boolean
  }
  if (!g.__INJECT_TRACE_CONSOLE_PATCHED__) {
    const originalConsoleWarn = console.warn.bind(console)
    console.warn = (...args: unknown[]) => {
      try {
        const text = args.map((a) => safeToText(a)).join(' ')
        const injectSig = 'inject() can only be used inside setup'
        const nuxtSig = 'A composable that requires access to the Nuxt instance'
        const isInjectWarn = text.includes(injectSig)
        const isUseNuxtAppWarn = text.includes(nuxtSig)
        if (isInjectWarn || isUseNuxtAppWarn) {
          const err = new Error(safeToText(args[0]))
          const stackLines = (err.stack || '').split('\n')
          const filtered = stackLines
            .filter(
              (line) =>
                line.includes('/projects/') || line.includes('/packages/')
            )
            .filter((line) => !line.includes('node_modules'))
          const hint = filtered[0]?.trim() || '(no userland frame)'
          forwardToServer({
            source: 'client-console-fallback',
            kind: isInjectWarn ? 'inject()' : 'nuxt-composable',
            message: text,
            hint,
            stack: filtered.slice(0, 12),
          })
        }
      } catch {
        // ignore
      } finally {
        originalConsoleWarn(...(args as any[]))
      }
    }
    g.__INJECT_TRACE_CONSOLE_PATCHED__ = true
  }
})
