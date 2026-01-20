import type { Ref } from 'vue'
import { ref } from 'vue'
import { useToastify } from './useToastify'

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


export function useEditHandler(
  updateFunction: UpdateFunction,
  options: EditHandlerOptions = {}
): EditHandlerReturn {
  const toast = useToastify()
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
        toast.success(`${label} updated successfully`)
        setTimeout(() => {
          if (saveStatus.value === 'saved') saveStatus.value = ''
        }, options.delay ?? 2000)
      } catch (error) {
        console.error(`Error saving ${label}:`, error)
        saveStatus.value = 'error'
        toast.error(`Failed to update ${label}`)
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
      toast.success(`${label} updated successfully`)
    } catch (error) {
      toast.error(`Failed to update ${label}`)
      throw error
    }
  }

  function autoSave(label: string, field: string, value: any): void {
    debouncedSave(label, field, value)
  }

  return { saveField, autoSave, saveStatus }
}
