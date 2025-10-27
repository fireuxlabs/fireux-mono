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

async function writeToClipboard(text: string): Promise<boolean> {
  if (!text) {
    return false
  }

  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    console.warn('useDevClipboard: navigator.clipboard unavailable')
    return false
  }

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('useDevClipboard: failed to write to clipboard', error)
    return false
  }
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
        color: 'yellow',
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
        color: 'green',
      })
    } else {
      toast?.add({
        title: options.error ?? 'Copy failed',
        description: 'Unable to access the clipboard',
        icon: 'i-lucide-x-circle',
        color: 'red',
      })
    }

    return success
  }

  const copyJSON = async (value: unknown, options: CopyOptions = {}) => {
    const payload =
      typeof value === 'string' ? value : JSON.stringify(value, null, 2) ?? ''

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
