// FILE: /packages/core/fireux-core/src/runtime/composables/app/utils/useEditHandler.ts
import { ref } from 'vue'
import type { Ref } from 'vue'

interface EditHandlerOptions {
  debounceTime?: number
  delay?: number
}

type SaveStatus = '' | 'saving' | 'saved' | 'error'
type UpdateFunction = (data: Record<string, any>) => Promise<void>

interface EditHandlerReturn {
  saveField: (label: string, field: string, newValue: any) => Promise<void>
  autoSave: (label: string, field: string, value: any) => void
  saveStatus: Ref<SaveStatus>
}

interface ToastInterface {
  add: (toast: { title: string; description: string; color: string }) => void
  success: (message: string, options?: any) => void
  error: (message: string, options?: any) => void
}

function getToast(): ToastInterface {
  const useToastFn = (globalThis as any).useToast
  if (typeof useToastFn === 'function') return useToastFn()
  return {
    add: ({ title, description, color }: any) => {
      console.log(`[${color?.toUpperCase()}] ${title}: ${description}`)
    },
    success: (message: string) => console.log(`✅ ${message}`),
    error: (message: string) => console.error(`❌ ${message}`),
  }
}

export function useEditHandler(
  updateFunction: UpdateFunction,
  options: EditHandlerOptions = {}
): EditHandlerReturn {
  const toast = getToast()
  const saveStatus = ref<SaveStatus>('')

  function simpleDebounce<T extends (...args: any[]) => void>(
    fn: T,
    wait: number
  ): T {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return ((...args: any[]) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), wait)
    }) as T
  }

  const debouncedSave = simpleDebounce(
    async (label: string, field: string, value: any) => {
      try {
        saveStatus.value = 'saving'
        if (typeof updateFunction !== 'function') {
          throw new Error('updateFunction is not a valid function.')
        }
        await updateFunction({ [field]: value })
        saveStatus.value = 'saved'
        toast.success(`${label} updated successfully`, { timeout: 3000 })
        setTimeout(() => {
          if (saveStatus.value === 'saved') saveStatus.value = ''
        }, options.delay ?? 2000)
      } catch (error) {
        console.error(`Error saving ${label}:`, error)
        saveStatus.value = 'error'
        toast.error(`Failed to update ${label}`, { timeout: 3000 })
      }
    },
    options.debounceTime ?? 800
  )

  async function saveField(
    label: string,
    field: string,
    newValue: any
  ): Promise<void> {
    try {
      saveStatus.value = 'saving'
      if (typeof updateFunction !== 'function') {
        throw new Error('updateFunction is not a valid function.')
      }
      await updateFunction({ [field]: newValue })
      saveStatus.value = 'saved'
      toast.add({
        title: 'Success',
        description: `${label} updated successfully.`,
        color: 'success',
      })
    } catch (error) {
      toast.add({
        title: 'Error',
        description: `Failed to update ${label}.`,
        color: 'error',
      })
      throw error
    }
  }

  function autoSave(label: string, field: string, value: any): void {
    debouncedSave(label, field, value)
  }

  return { saveField, autoSave, saveStatus }
}
