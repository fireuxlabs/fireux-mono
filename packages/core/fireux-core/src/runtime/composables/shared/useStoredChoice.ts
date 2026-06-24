import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

type UseStoredChoiceOptions<T extends string> = {
  key?: MaybeRefOrGetter<string | null | undefined>
  choices: MaybeRefOrGetter<readonly T[]>
  fallback: MaybeRefOrGetter<T>
}

const text = (value: unknown) => String(value ?? '').trim()

export function useStoredChoice<T extends string>(
  options: UseStoredChoiceOptions<T>
) {
  const key = computed(() => text(toValue(options.key)))
  const choices = computed(() => Array.from(toValue(options.choices)))
  const fallback = computed(() => {
    const next = toValue(options.fallback)

    return choices.value.includes(next) ? next : choices.value[0] ?? next
  })
  const selected = ref(fallback.value) as Ref<T>
  const stored = ref<T | ''>('')
  const storageReady = ref(!import.meta.client)
  const initialChoiceResolved = ref(false)
  const isChoice = (value: unknown): value is T =>
    typeof value === 'string' && choices.value.includes(value as T)

  // Shared choice spine: domain composables own the meaning; this only restores and persists one valid string option.
  watch(
    [choices, fallback, stored, storageReady],
    ([available, nextFallback, nextStored]) => {
      if (!storageReady.value) return

      if (!initialChoiceResolved.value) {
        selected.value = available.includes(nextStored as T)
          ? nextStored as T
          : nextFallback
        initialChoiceResolved.value = true
        return
      }

      if (!available.includes(selected.value)) {
        selected.value = available.includes(nextStored as T)
          ? nextStored as T
          : nextFallback
      }
    },
    { immediate: true }
  )

  watch(
    key,
    (nextKey) => {
      if (!import.meta.client) return

      stored.value = nextKey && isChoice(window.localStorage.getItem(nextKey))
        ? window.localStorage.getItem(nextKey) as T
        : ''
      initialChoiceResolved.value = false
      storageReady.value = true
    },
    { immediate: true }
  )

  watch(selected, (next) => {
    if (!import.meta.client || !key.value) return

    stored.value = next
    window.localStorage.setItem(key.value, next)
  })

  return {
    selected,
    stored,
    storageReady,
  }
}
