import {
  computed,
  getCurrentInstance,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { normalizeSlug } from '../../utils/slug/normalizeSlug'

export type ValidationResult = {
  isValid: boolean
  message?: string
}

export type ValidationFn = ((value: string) => ValidationResult) | null

export type FormattingFn = ((value: string) => string) | null

export type UpdateFn = (value: string) => unknown | Promise<unknown>

type Options = {
  label?: MaybeRefOrGetter<string>
  value?: MaybeRefOrGetter<string | number | null | undefined>
  placeholder?: MaybeRefOrGetter<string>
  type?: MaybeRefOrGetter<string>
  maxlength?: MaybeRefOrGetter<number>
  rows?: MaybeRefOrGetter<number>
  id?: MaybeRefOrGetter<string | undefined>
  disabled?: MaybeRefOrGetter<boolean>
  disabledMessage?: MaybeRefOrGetter<string>
  validationFunction?: MaybeRefOrGetter<ValidationFn>
  formattingFunction?: MaybeRefOrGetter<FormattingFn>
  update: UpdateFn
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

  const isTextarea = computed(() => toValue(options.type) === 'textarea')

  const disabled = computed(() => Boolean(toValue(options.disabled)))
  const disabledMessage = computed(() =>
    (toValue(options.disabledMessage) || '').trim()
  )

  const instance = getCurrentInstance()
  const instanceId = instance?.uid ?? 0

  const inputId = computed(() => {
    const id = toValue(options.id)
    if (id) return id
    const label = toValue(options.label)
    const labelSlug = label ? normalizeSlug(label) : 'field'
    return `simple-field-${labelSlug}-${instanceId}`
  })

  const inputType = computed(() => {
    if (isTextarea.value) return 'text'
    const type = toValue(options.type) || 'text'
    if (['email', 'tel', 'number', 'password', 'url'].includes(type))
      return type
    return 'text'
  })

  watch(
    () => toValue(options.value),
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
      : toStringValue(toValue(options.value))
  )

  const displayValue = computed(() => {
    const raw = effectiveValue.value.trim()
    if (raw.length) return raw
    const placeholder = toValue(options.placeholder)
    if (placeholder?.length) return placeholder
    return 'Not set'
  })

  function startEditing() {
    if (disabled.value) return
    draft.value = toStringValue(toValue(options.value))
    isEditing.value = true
    errorMessage.value = ''
  }

  function cancel() {
    draft.value = toStringValue(toValue(options.value))
    isEditing.value = false
    errorMessage.value = ''
  }

  async function clear() {
    if (saving.value) return
    if (disabled.value) return

    saving.value = true
    errorMessage.value = ''
    try {
      await options.update('')
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

    const validationFunction = toValue(options.validationFunction)
    if (validationFunction) {
      try {
        const result = validationFunction(trimmed)
        if (!result?.isValid) {
          errorMessage.value = result?.message || 'Invalid value'
          return
        }
      } catch {
        errorMessage.value = 'Validation failed.'
        return
      }
    }

    const formattingFunction = toValue(options.formattingFunction)
    const valueToSave = formattingFunction
      ? formattingFunction(trimmed)
      : trimmed

    saving.value = true
    try {
      await options.update(valueToSave)
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
