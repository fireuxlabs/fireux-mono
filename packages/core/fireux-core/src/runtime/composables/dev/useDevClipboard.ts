import { ref } from 'vue'

interface ToastApi {
  add: (options: {
    title?: string
    description?: string
    icon?: string
    color?: string
    timeout?: number
  }) => void
}

interface CopyOptions {
  label?: string
  success?: string
  error?: string
}

function resolveToast(): ToastApi | undefined {
  const useToastFn = (globalThis as any).useToast as
    | undefined
    | (() => ToastApi)

  if (typeof useToastFn === 'function') {
    try {
      return useToastFn()
    } catch (error) {
      console.warn('useDevClipboard: failed to resolve toast instance', error)
    }
  }

  return undefined
}

function writeToClipboardLegacy(text: string): boolean {
  if (!text) {
    return false
  }

  if (typeof document === 'undefined') {
    return false
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', 'true')

    textarea.style.position = 'fixed'
    textarea.style.top = '0'
    textarea.style.left = '0'
    textarea.style.width = '1px'
    textarea.style.height = '1px'
    textarea.style.opacity = '0'
    textarea.style.pointerEvents = 'none'

    document.body.appendChild(textarea)

    const activeElement = document.activeElement as HTMLElement | null
    textarea.focus()
    textarea.select()

    const ok = document.execCommand('copy')

    textarea.remove()
    activeElement?.focus?.()

    return ok
  } catch (error) {
    console.error('useDevClipboard: legacy copy failed', error)
    return false
  }
}

function createSafeJsonReplacer() {
  const seen = new WeakSet<object>()

  return (_key: string, value: unknown) => {
    if (typeof value === 'bigint') {
      return value.toString()
    }

    if (value && typeof value === 'object') {
      const obj = value as object
      if (seen.has(obj)) {
        return '[Circular]'
      }
      seen.add(obj)
    }

    return value
  }
}

async function writeToClipboard(text: string): Promise<boolean> {
  if (!text) {
    return false
  }

  const hasClipboardApi =
    typeof navigator !== 'undefined' && Boolean(navigator.clipboard)

  if (hasClipboardApi) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('useDevClipboard: failed to write to clipboard', error)
    }
  } else {
    console.warn('useDevClipboard: navigator.clipboard unavailable')
  }

  return writeToClipboardLegacy(text)
}

export function useDevClipboard() {
  const copying = ref(false)
  const toast = resolveToast()

  const copyText = async (text: string, options: CopyOptions = {}) => {
    if (!text) {
      toast?.add({
        title: options.error ?? 'Nothing to copy',
        description: options.label,
        icon: 'i-lucide-alert-circle',
        color: 'warning',
      })
      return false
    }

    if (copying.value) {
      return false
    }

    copying.value = true

    const success = await writeToClipboard(text)

    copying.value = false

    if (success) {
      toast?.add({
        title: options.success ?? 'Copied to clipboard',
        description: options.label,
        icon: 'i-lucide-clipboard-check',
        color: 'success',
      })
    } else {
      toast?.add({
        title: options.error ?? 'Copy failed',
        description: 'Unable to access the clipboard',
        icon: 'i-lucide-x-circle',
        color: 'error',
      })
    }

    return success
  }

  const copyJSON = async (value: unknown, options: CopyOptions = {}) => {
    let payload = ''

    if (typeof value === 'string') {
      payload = value
    } else {
      try {
        payload = JSON.stringify(value, createSafeJsonReplacer(), 2) ?? ''
      } catch (error) {
        console.error('useDevClipboard: failed to stringify JSON payload', error)
        payload = ''
      }
    }

    return copyText(payload, {
      label: options.label ?? 'JSON copied to clipboard',
      success: options.success,
      error: options.error,
    })
  }

  return {
    copying,
    copyText,
    copyJSON,
  }
}
