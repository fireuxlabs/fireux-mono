import { useToast } from '#imports'

const TOAST_TIMEOUT = 3000

type ToastApi = {
  add?: (options: any) => unknown
  success?: (message: string, options?: { timeout?: number }) => void
  error?: (message: string, options?: { timeout?: number }) => void
  warn?: (message: string, options?: { timeout?: number }) => void
}

type ToastCaller = (message: string) => void

type Toastify = {
  success: ToastCaller
  error: ToastCaller
  warn: ToastCaller
  add: (options: {
    title?: string
    description?: string
    color?: string
    icon?: string
  }) => void
  withToast: <T extends unknown[]>(
    fn: (...args: T) => Promise<unknown>,
    messages: { ok: string; fail: string }
  ) => (...args: T) => Promise<unknown>
}

function resolveToast(): ToastApi | null {
  if (typeof window !== 'undefined') {
    try {
      return useToast()
    } catch (error) {
      console.warn('[useToastify] Failed to resolve useToast()', error)
    }
  }

  return null
}

async function copyToClipboard(message: string) {
  if (!message) return
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(message)
    return
  }

  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea')
    textarea.value = message
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

function buildToastOptions(type: 'success' | 'error' | 'warn', message: string) {
  let color = 'warning'
  let title = 'Notice'
  if (type === 'success') {
    color = 'success'
    title = 'Success'
  } else if (type === 'error') {
    color = 'error'
    title = 'Error'
  }

  return {
    title,
    description: message,
    color,
    timeout: TOAST_TIMEOUT,
    actions: [
      {
        label: 'Copy',
        onClick: () => copyToClipboard(message),
      },
    ],
  }
}

function buildCustomToastOptions(options: {
  title?: string
  description?: string
  color?: string
  icon?: string
}) {
  const message = options.description || options.title || ''
  return {
    title: options.title,
    description: options.description,
    color: options.color,
    icon: options.icon,
    timeout: TOAST_TIMEOUT,
    actions: message
      ? [
          {
            label: 'Copy',
            onClick: () => copyToClipboard(message),
          },
        ]
      : undefined,
  }
}

function callWithFallback(
  toast: ToastApi | null,
  type: 'success' | 'error' | 'warn',
  message: string
) {
  if (!message) return
  const fallback = () => {
    let prefix = '⚠️'
    let logger: (...args: any[]) => void = console.warn

    if (type === 'success') {
      prefix = '✅'
      logger = console.log
    } else if (type === 'error') {
      prefix = '❌'
      logger = console.error
    }

    logger(`${prefix} ${message}`)
  }

  if (!toast) {
    fallback()
    return
  }

  if (typeof toast.add === 'function') {
    toast.add(buildToastOptions(type, message))
    return
  }

  fallback()
}

export function useToastify(): Toastify {
  const toast = resolveToast()

  const success: ToastCaller = (message) =>
    callWithFallback(toast, 'success', message)
  const error: ToastCaller = (message) =>
    callWithFallback(toast, 'error', message)
  const warn: ToastCaller = (message) =>
    callWithFallback(toast, 'warn', message)

  const withToast =
    <T extends unknown[]>(
      fn: (...args: T) => Promise<unknown>,
      messages: { ok: string; fail: string }
    ) =>
    async (...args: T) => {
      try {
        await fn(...args)
        if (messages.ok) success(messages.ok)
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'Please try again.'
        const prefix = messages.fail ? `${messages.fail}: ` : ''
        error(`${prefix}${detail}`)
        throw err
      }
    }

  return {
    success,
    error,
    warn,
    add: (options) => {
      if (!toast || typeof toast.add !== 'function') {
        const message = options.description || options.title || ''
        if (message) console.log(`🔔 ${message}`)
        return
      }
      toast.add(buildCustomToastOptions(options))
    },
    withToast,
  }
}
