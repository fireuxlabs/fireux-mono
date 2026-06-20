import { defineNuxtPlugin } from '#imports'
import type { NuxtApp } from 'nuxt/app'
import type { ComponentPublicInstance } from 'vue'

/**
 * inject-trace.client
 * Dev helper: intercept Vue warns for setup-only API misuse and print a focused
 * report with component file and filtered stack lines.
 */
export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  if (process.env.NODE_ENV === 'production') return
  if (process.env.FIREUX_INJECT_TRACE !== '1') return

  // Minimal startup marker (kept concise to avoid client noise)
  console.info(
    '%c[InjectTrace]%c running',
    'color:#ef4444;font-weight:bold',
    'color:inherit'
  )

  const config = nuxtApp.vueApp.config
  const originalWarnHandler = config.warnHandler

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

  function classifyWarning(message: string):
    | 'inject()'
    | 'nuxt-composable'
    | 'vue-lifecycle'
    | null {
    if (message.includes('inject() can only be used inside setup')) {
      return 'inject()'
    }

    if (
      message.includes('A composable that requires access to the Nuxt instance')
    ) {
      return 'nuxt-composable'
    }

    if (
      message.includes(
        'onMounted is called when there is no active component instance'
      ) ||
      message.includes(
        'Lifecycle injection APIs can only be used during execution of setup'
      )
    ) {
      return 'vue-lifecycle'
    }

    return null
  }

  function filteredStackLines(...sources: Array<string | undefined>) {
    return sources
      .flatMap((source) => String(source || '').split('\n'))
      .filter(
        (line) => line.includes('/projects/') || line.includes('/packages/')
      )
      .filter((line) => !line.includes('node_modules'))
  }

  function logClientDiagnostic(payload: {
    source: string
    kind: string
    message: string
    component?: { name: string; file: string }
    hint: string
    stack: string[]
    rawTrace?: string
  }) {
    const component = payload.component
      ? `\nComponent: ${payload.component.name} (${payload.component.file})`
      : ''
    const stack = payload.stack.length
      ? `\nStack:\n${payload.stack.join('\n')}`
      : ''
    const rawTrace = payload.rawTrace
      ? `\nRaw trace:\n${payload.rawTrace}`
      : ''
    const href =
      typeof window !== 'undefined' ? `\nHref: ${window.location.href}` : ''

    console.info(
      `[InjectTrace] ${payload.kind} misuse\n` +
        `Source: ${payload.source}\n` +
        `Message: ${payload.message}${component}\n` +
        `Hint: ${payload.hint}${stack}${rawTrace}${href}`
    )
  }

  config.warnHandler = (
    message: string,
    instance: ComponentPublicInstance | null,
    trace: string
  ) => {
    const msg = String(message ?? '')
    const kind = classifyWarning(msg)

    if (kind) {
      const comp = (instance ?? {}) as {
        type?: { __file?: string; name?: string }
        __file?: string
        name?: string
      }
      const file = comp?.type?.__file ?? comp?.__file ?? 'unknown-file'
      const name = comp?.type?.name ?? comp?.name ?? 'anonymous-component'

      const err = new Error(msg)
      const filtered = filteredStackLines(trace, err.stack)
      const hint =
        filtered[0]?.trim() ||
        (trace ? String(trace).split('\n')[0] : '') ||
        '(no userland frame)'

      // Forward to server (no client console noise)
      const payload = {
        source: 'client-warnHandler',
        kind,
        message: msg,
        component: { name, file },
        hint,
        stack: filtered.slice(0, 12),
        rawTrace: trace || undefined,
      }

      logClientDiagnostic(payload)
      forwardToServer(payload)
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
        const kind = classifyWarning(text)

        if (kind) {
          const err = new Error(safeToText(args[0]))
          const rawTrace = args.map((a) => safeToText(a)).join('\n')
          const filtered = filteredStackLines(rawTrace, err.stack)
          const hint = filtered[0]?.trim() || '(no userland frame)'
          const payload = {
            source: 'client-console-fallback',
            kind,
            message: text,
            hint,
            stack: filtered.slice(0, 12),
            rawTrace,
          }

          logClientDiagnostic(payload)
          forwardToServer(payload)
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
