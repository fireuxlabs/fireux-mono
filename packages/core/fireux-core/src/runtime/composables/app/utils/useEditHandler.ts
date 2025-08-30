import { debounce } from 'lodash'
import { ref } from 'vue'
import type { Ref } from 'vue'

// Type definitions
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

// Toast interface for fallback
interface ToastInterface {
  add: (toast: { title: string; description: string; color: string }) => void
  success: (message: string, options?: any) => void
  error: (message: string, options?: any) => void
}

// Helper function to get toast instance with fallback
function getToast(): ToastInterface {
  try {
    // Try to get useToast from global scope (auto-imported by Nuxt UI)
    const useToastFn =
      (globalThis as any).useToast ||
      (() => {
        throw new Error('useToast not available')
      })
    return useToastFn()
  } catch (error) {
    // Fallback implementation
    return {
      add: ({ title, description, color }: any) => {
        console.log(`[${color?.toUpperCase()}] ${title}: ${description}`)
      },
      success: (message: string, _options?: any) => {
        console.log(`✅ ${message}`)
      },
      error: (message: string, _options?: any) => {
        console.error(`❌ ${message}`)
      },
    }
  }
}

function useEditHandler(
  updateFunction: UpdateFunction,
  options: EditHandlerOptions = {}
): EditHandlerReturn {
  const toast = getToast()
  const saveStatus = ref<SaveStatus>('')

  // Debounced save function for fields that require delayed updates
  const debouncedSave = debounce(
    async (label: string, field: string, value: any) => {
      try {
        saveStatus.value = 'saving'
        if (typeof updateFunction !== 'function') {
          throw new Error('updateFunction is not a valid function.')
        }
        await updateFunction({ [field]: value })
        saveStatus.value = 'saved'

        // Success toast with label
        toast.success(`${label} updated successfully`, { timeout: 3000 })

        setTimeout(() => {
          if (saveStatus.value === 'saved') {
            saveStatus.value = ''
          }
        }, options.delay || 2000)
      } catch (error) {
        console.error(`Error saving ${label}:`, error)
        saveStatus.value = 'error'

        // Error toast
        toast.error(`Failed to update ${label}`, { timeout: 3000 })
      }
    },
    options.debounceTime || 800
  )

  // Immediate save function (non-debounced)
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

  // Wrapper for debounced save
  function autoSave(label: string, field: string, value: any): void {
    debouncedSave(label, field, value)
  }

  return { saveField, autoSave, saveStatus }
}

// Export the function
export { useEditHandler }
