// Concurrent edit — 2026-07-20 23:42 CEST — Nuxt Package Toolchain Pass 2 of 3: publish portable persisted-choice declarations.
import {
  computed,
  onMounted,
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

export type UseStoredChoiceReturn<T extends string> = {
  selected: Ref<T>
  stored: Ref<T | ''>
  storageReady: Ref<boolean>
}

const text = (value: unknown) => String(value ?? '').trim()

export function useStoredChoice<T extends string>(
  options: UseStoredChoiceOptions<T>
): UseStoredChoiceReturn<T> {
  const key = computed(() => text(toValue(options.key)))
  const choices = computed<T[]>(() => Array.from(toValue(options.choices)))
  const fallback = computed(() => {
    const next = toValue(options.fallback)

    return choices.value.includes(next) ? next : choices.value[0] ?? next
  })
  const selected = ref(fallback.value) as Ref<T>
  const stored = ref<T | ''>('') as Ref<T | ''>
  const storageReady = ref(!import.meta.client)
  const mounted = ref(!import.meta.client)
  const initialChoiceResolved = ref(false)
  const isChoice = (value: unknown): value is T =>
    typeof value === 'string' && choices.value.includes(value as T)
  const readStoredChoice = (nextKey: string) =>
    nextKey && isChoice(window.localStorage.getItem(nextKey))
      ? window.localStorage.getItem(nextKey) as T
      : ''

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
    { immediate: true, flush: 'sync' }
  )

  watch(
    key,
    (nextKey: string) => {
      if (!import.meta.client || !mounted.value) return

      stored.value = readStoredChoice(nextKey)
      initialChoiceResolved.value = false
      storageReady.value = true
    },
    { immediate: true }
  )

  onMounted(() => {
    mounted.value = true
    stored.value = readStoredChoice(key.value)
    initialChoiceResolved.value = false
    storageReady.value = true
  })

  watch(selected, (next: T) => {
    if (!import.meta.client || !mounted.value || !key.value) return

    stored.value = next
    window.localStorage.setItem(key.value, next)
  })

  return {
    selected,
    stored,
    storageReady,
  }
}
