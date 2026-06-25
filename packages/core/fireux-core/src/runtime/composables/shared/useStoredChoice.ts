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
type StoredChoiceWatchState<T extends string> = readonly [T[], T, T | '', boolean]

const text = (value: unknown) => String(value ?? '').trim()

export function useStoredChoice<T extends string>(
  options: UseStoredChoiceOptions<T>
) {
  const key = computed(() => text(toValue(options.key)))
  const choices = computed<T[]>(() => Array.from(toValue(options.choices)))
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
    () => [choices.value, fallback.value, stored.value, storageReady.value] as const,
    (state: StoredChoiceWatchState<T>) => {
      const [available, nextFallback, nextStored, ready] = state
      if (!ready) return

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
    (nextKey: string) => {
      if (!import.meta.client) return

      stored.value = nextKey && isChoice(window.localStorage.getItem(nextKey))
        ? window.localStorage.getItem(nextKey) as T
        : ''
      initialChoiceResolved.value = false
      storageReady.value = true
    },
    { immediate: true }
  )

  watch(selected, (next: T) => {
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
