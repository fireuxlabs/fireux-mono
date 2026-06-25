import { computed, getCurrentInstance, ref, watch } from 'vue'
import { normalizeSlug } from '../../../../utils/slug/normalizeSlug'

export type ValidationResult = {
  isValid: boolean
  message?: string
}

export type ValidationFn = ((value: string) => ValidationResult) | null

export type FormattingFn = ((value: string) => string) | null

export type UpdateFn = (value: string) => unknown | Promise<unknown>

type Options = {
  label?: string
  firebaseValue?: string | number | null
  placeholder?: string
  type?: string
  maxlength?: number
  rows?: number
  id?: string
  disabled?: boolean
  disabledMessage?: string
  validationFunction?: ValidationFn
  formattingFunction?: FormattingFn
  updateFunction: UpdateFn
  emitUpdated?: (value: string) => void
}

const toStringValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return ''
  return String(value)
}

export function useEditableStringField(options: Options) {
  const isEditing = ref(false)
  const draft = ref('')
  const optimisticValue = ref<string | null>(null)
  const saving = ref(false)
  const errorMessage = ref('')

  const isTextarea = computed(() => options.type === 'textarea')

  const disabled = computed(() => Boolean(options.disabled))
  const disabledMessage = computed(() => (options.disabledMessage || '').trim())

  const instance = getCurrentInstance()
  const instanceId = instance?.uid ?? 0

  const inputId = computed(() => {
    if (options.id) return options.id
    const labelSlug = options.label ? normalizeSlug(options.label) : 'field'
    return `simple-field-${labelSlug}-${instanceId}`
  })

  const inputType = computed(() => {
    if (isTextarea.value) return 'text'
    const type = options.type || 'text'
    if (['email', 'tel', 'number', 'password', 'url'].includes(type)) return type
    return 'text'
  })

  watch(
    () => options.firebaseValue,
    (next: string | number | null | undefined) => {
      if (!isEditing.value) {
        const nextValue = toStringValue(next)
        draft.value = nextValue
        optimisticValue.value = null
      }
    },
    { immediate: true }
  )

  const effectiveValue = computed(() =>
    optimisticValue.value !== null
      ? optimisticValue.value
      : toStringValue(options.firebaseValue)
  )

  const displayValue = computed(() => {
    const raw = effectiveValue.value.trim()
    if (raw.length) return raw
    if (options.placeholder?.length) return options.placeholder
    return 'Not set'
  })

  function startEditing() {
    if (disabled.value) return
    draft.value = toStringValue(options.firebaseValue)
    isEditing.value = true
    errorMessage.value = ''
  }

  function cancel() {
    draft.value = toStringValue(options.firebaseValue)
    isEditing.value = false
    errorMessage.value = ''
  }

  async function clear() {
    if (saving.value) return
    if (disabled.value) return

    saving.value = true
    errorMessage.value = ''
    try {
      await options.updateFunction('')
      options.emitUpdated?.('')
      isEditing.value = false
      optimisticValue.value = ''
      draft.value = ''
    } catch (error) {
      errorMessage.value = (error as Error)?.message || 'Error clearing value.'
    } finally {
      saving.value = false
    }
  }

  function saveOnEnter(event: KeyboardEvent) {
    if (!isTextarea.value) {
      save()
      return
    }

    if (event.metaKey || event.ctrlKey) {
      event.preventDefault()
      save()
    }
  }

  async function save() {
    if (saving.value) return

    errorMessage.value = ''
    const trimmed = (draft.value || '').trim()

    if (options.validationFunction) {
      try {
        const result = options.validationFunction(trimmed)
        if (!result?.isValid) {
          errorMessage.value = result?.message || 'Invalid value'
          return
        }
      } catch {
        errorMessage.value = 'Validation failed.'
        return
      }
    }

    const valueToSave = options.formattingFunction
      ? options.formattingFunction(trimmed)
      : trimmed

    saving.value = true
    try {
      await options.updateFunction(valueToSave)
      options.emitUpdated?.(valueToSave)
      optimisticValue.value = valueToSave
      draft.value = valueToSave
      isEditing.value = false
    } catch (error) {
      errorMessage.value = (error as Error)?.message || 'Error saving value.'
    } finally {
      saving.value = false
    }
  }

  return {
    isEditing,
    draft,
    saving,
    errorMessage,
    disabled,
    disabledMessage,
    isTextarea,
    inputId,
    inputType,
    effectiveValue,
    displayValue,
    startEditing,
    cancel,
    clear,
    save,
    saveOnEnter,
  }
}
