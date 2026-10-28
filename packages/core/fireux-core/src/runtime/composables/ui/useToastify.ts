import { useToast } from '#imports'
import { useClipboard } from '@vueuse/core'

type ToastOptions = Pick<
  Parameters<ReturnType<typeof useToast>['add']>[0],
  'color' | 'icon'
> & { title?: string; description?: string }

/** Shared feedback copy and duration over Nuxt UI's toast owner. */
export function useToastify() {
  const toast = useToast()
  const { copy, isSupported } = useClipboard()

  const copyMessage = async (message: string) => {
    try {
      if (!isSupported.value) throw new Error('Clipboard unavailable')
      await copy(message)
    } catch {
      toast.add({
        title: 'Copy failed',
        description: 'Unable to access the clipboard.',
        color: 'error',
      })
    }
  }

  const add = (options: ToastOptions) => {
    const message = options.description || options.title || ''
    return toast.add({
      ...options,
      duration: 3000,
      actions: message
        ? [{ label: 'Copy', onClick: () => copyMessage(message) }]
        : undefined,
    })
  }

  const notify = (
    title: string,
    color: ToastOptions['color'],
    message: string
  ) => {
    if (message) add({ title, color, description: message })
  }

  return {
    success: (message: string) => notify('Success', 'success', message),
    error: (message: string) => notify('Error', 'error', message),
    warn: (message: string) => notify('Notice', 'warning', message),
    add,
  }
}
