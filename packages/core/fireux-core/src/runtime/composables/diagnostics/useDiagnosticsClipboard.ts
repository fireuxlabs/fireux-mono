import { ref } from 'vue'
import { useToast } from '#imports'
import { useClipboard } from '@vueuse/core'

interface CopyOptions {
  label?: string
  success?: string
  error?: string
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

/** Diagnostics own safe JSON and copy feedback; VueUse owns clipboard access. */
export function useDiagnosticsClipboard() {
  const copying = ref(false)
  const toast = useToast()
  const { copy, isSupported } = useClipboard()

  const copyText = async (text: string, options: CopyOptions = {}) => {
    if (!text) {
      toast.add({
        title: options.error ?? 'Nothing to copy',
        description: options.label,
        icon: 'i-lucide-alert-circle',
        color: 'warning',
      })
      return false
    }
    if (copying.value) return false

    copying.value = true
    try {
      if (!isSupported.value) throw new Error('Clipboard unavailable')
      await copy(text)
      toast.add({
        title: options.success ?? 'Copied to clipboard',
        description: options.label,
        icon: 'i-lucide-clipboard-check',
        color: 'success',
      })
      return true
    } catch {
      toast.add({
        title: options.error ?? 'Copy failed',
        description: 'Unable to access the clipboard',
        icon: 'i-lucide-x-circle',
        color: 'error',
      })
      return false
    } finally {
      copying.value = false
    }
  }

  const copyJSON = async (value: unknown, options: CopyOptions = {}) => {
    let payload = ''

    if (typeof value === 'string') {
      payload = value
    } else {
      try {
        payload = JSON.stringify(value, createSafeJsonReplacer(), 2) ?? ''
      } catch (error) {
        console.error(
          'useDiagnosticsClipboard: failed to stringify JSON payload',
          error
        )
        payload = ''
      }
    }

    return copyText(payload, {
      label: options.label ?? 'JSON copied to clipboard',
      success: options.success,
      error: options.error,
    })
  }

  return { copying, copyText, copyJSON }
}
