import { useToast } from '#imports'

const TOAST_TIMEOUT = 3000

type ToastApi = {
  add?: (options: {
    title?: string
    description?: string
    color?: string
    timeout?: number
  }) => void
  success?: (message: string, options?: { timeout?: number }) => void
  error?: (message: string, options?: { timeout?: number }) => void
  warn?: (message: string, options?: { timeout?: number }) => void
}

type ToastCaller = (message: string) => void

type Toastify = {
  success: ToastCaller
  error: ToastCaller
  warn: ToastCaller
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

  const legacyUseToast = (globalThis as any)?.useToast
  if (typeof legacyUseToast === 'function') {
    try {
      return legacyUseToast()
    } catch (error) {
      console.warn('[useToastify] Failed to resolve legacy useToast()', error)
    }
  }

  return null
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

  let addColor = 'warning'
  if (type === 'success') addColor = 'success'
  else if (type === 'error') addColor = 'error'

  let addTitle = 'Notice'
  if (type === 'success') addTitle = 'Success'
  else if (type === 'error') addTitle = 'Error'

  if (!toast) {
    fallback()
    return
  }

  if (type === 'success' && typeof toast.success === 'function') {
    toast.success(message, { timeout: TOAST_TIMEOUT })
    return
  }

  if (type === 'error' && typeof toast.error === 'function') {
    toast.error(message, { timeout: TOAST_TIMEOUT })
    return
  }

  if (type === 'warn' && typeof toast.warn === 'function') {
    toast.warn(message, { timeout: TOAST_TIMEOUT })
    return
  }

  if (typeof toast.add === 'function') {
    toast.add({
      title: addTitle,
      description: message,
      color: addColor,
      timeout: TOAST_TIMEOUT,
    })
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
    withToast,
  }
}
