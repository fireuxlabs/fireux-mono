import {
  computed,
  getCurrentInstance,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type WatchSource,
} from 'vue'
import { useCommandScope } from '../fireux/commands/useCommandScope'
import { normalizeSlug } from '../../utils/slug/normalize-slug'

export type ValidationResult = {
  isValid: boolean
  message?: string
}

export type ValidationFn = ((value: string) => ValidationResult) | null

export type FormattingFn = ((value: string) => string) | null

export type UpdateFn = (
  value: string,
  isSurfaceCurrent?: () => boolean
) => unknown | Promise<unknown>

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
  captureIntent?: () => () => boolean
  sources?: WatchSource[]
  update: UpdateFn
  emitUpdated?: (value: string) => void
}

const toStringValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return ''
  return String(value)
}

export function useEditableStringField(options: Options) {
  const isEditing = ref(false)
  const draft = ref<string | number>('')
  const optimisticValue = ref<string | null>(null)
  const saving = ref(false)
  const errorMessage = ref('')
  const sourceValue = computed(() => toStringValue(toValue(options.value)))
  const sourceRevision = ref(0)
  let submission: { value: string } | undefined
  const completionSources = [
    ...(options.sources ?? []),
    draft,
    isEditing,
    sourceRevision,
    () => toValue(options.id),
    () => (options.captureIntent ? undefined : toValue(options.disabled)),
  ]
  const captureCompletion = useCommandScope(completionSources)
  watch(
    completionSources,
    () => {
      saving.value = false
    },
    { flush: 'sync' }
  )

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
    sourceValue,
    (next) => {
      // A listener may acknowledge our write before its command response.
      if (!submission || next !== submission.value) sourceRevision.value++
      if (!isEditing.value) {
        draft.value = next
        optimisticValue.value = null
      }
    },
    { immediate: true, flush: 'sync' }
  )

  const effectiveValue = computed(() =>
    optimisticValue.value !== null ? optimisticValue.value : sourceValue.value
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

  async function persist(value: string, fallback: string) {
    const operation = { value }
    submission = operation
    const isCurrent = captureCompletion()
    const isOwnerCurrent = options.captureIntent?.() ?? (() => true)
    saving.value = true
    errorMessage.value = ''
    try {
      await options.update(value, () => isCurrent() && isOwnerCurrent())
      if (!isCurrent()) return
      saving.value = false
      if (!isOwnerCurrent()) return
      optimisticValue.value = value
      draft.value = value
      isEditing.value = false
      options.emitUpdated?.(value)
    } catch (error) {
      if (!isCurrent()) return
      saving.value = false
      if (!isOwnerCurrent()) return
      errorMessage.value = (error as Error)?.message || fallback
    } finally {
      if (submission === operation) submission = undefined
    }
  }

  async function clear() {
    if (saving.value || disabled.value) return
    await persist('', 'Error clearing value.')
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
    if (saving.value || disabled.value) return

    errorMessage.value = ''
    const trimmed = toStringValue(draft.value).trim()

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

    await persist(valueToSave, 'Error saving value.')
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
