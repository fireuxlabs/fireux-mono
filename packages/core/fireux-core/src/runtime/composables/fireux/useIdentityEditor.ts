import {
  computed,
  onScopeDispose,
  ref,
  toRaw,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
  type WatchSource,
} from 'vue'
import { useCommandScope } from './commands/useCommandScope'

/** Grouped Identity drafts; fields, validation, modal policy and commands stay domain-owned. */
export function useIdentityEditor<Draft extends object>(options: {
  open: Ref<boolean>
  scope: WatchSource[]
  canEdit: MaybeRefOrGetter<boolean>
  createDraft: () => Draft
  signature: (draft: Draft) => string
  save: (draft: Draft, isCurrent: () => boolean) => Promise<unknown>
  onSaved?: () => void
  errorMessage: string
}) {
  const copy = (value: Draft): Draft => structuredClone(toRaw(value))
  const draft = ref(copy(options.createDraft())) as Ref<Draft>
  const signature = computed(() => options.signature(draft.value))
  const original = ref(signature.value)
  const changed = computed(() => signature.value !== original.value)
  const saving = ref(false)
  const error = ref('')
  const canEdit = computed(() => Boolean(toValue(options.canEdit)))
  const sourceSignature = computed(() =>
    options.signature(options.createDraft())
  )
  const sourceRevision = ref(0)
  let activeAttempt: { signature: string } | undefined
  let disposed = false

  // A listener can acknowledge this write before the command response arrives.
  // Other source changes invalidate continuation without replacing an open draft.
  watch(
    sourceSignature,
    (next) => {
      if (!activeAttempt || next !== activeAttempt.signature)
        sourceRevision.value++
    },
    { flush: 'sync' }
  )
  const capture = useCommandScope([
    ...options.scope,
    canEdit,
    options.open,
    signature,
    sourceRevision,
  ])

  function release() {
    activeAttempt = undefined
    saving.value = false
  }
  function reset() {
    release()
    draft.value = copy(options.createDraft())
    original.value = signature.value
    error.value = ''
  }
  watch(
    options.open,
    (open) => {
      if (!open) release()
      else if (canEdit.value) reset()
      else options.open.value = false
    },
    { immediate: true, flush: 'sync' }
  )
  watch(
    [...options.scope, canEdit],
    () => {
      options.open.value = false
      reset()
    },
    { flush: 'sync' }
  )
  onScopeDispose(() => {
    disposed = true
    release()
  })

  function begin(prepare?: (draft: Draft) => void) {
    if (disposed || !canEdit.value) return false
    if (options.open.value) reset()
    else options.open.value = true
    prepare?.(draft.value)
    return true
  }

  async function save() {
    if (disposed || saving.value || !options.open.value || !canEdit.value)
      return
    const attempt = { signature: signature.value }
    activeAttempt = attempt
    const inScope = capture()
    const isCurrent = () => activeAttempt === attempt && inScope()
    saving.value = true
    error.value = ''
    try {
      await options.save(copy(draft.value), isCurrent)
      if (isCurrent()) options.onSaved?.()
    } catch (cause) {
      if (isCurrent())
        error.value =
          cause instanceof Error ? cause.message : options.errorMessage
    } finally {
      if (activeAttempt === attempt) release()
    }
  }

  return { draft, changed, saving, error, begin, reset, save }
}
