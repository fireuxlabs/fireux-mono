import { computed, ref, watch, type Ref } from 'vue'
import { loadLogoForPlace } from './place-logo-loader'
import { toLogoCard } from './place-logo-card'
import type {
  HydrateLogoOptions,
  LoadLogoOptions,
  PlaceLogoState,
  PlaceLogoTarget,
  SanitizedAvatar,
  UsePlaceLogoStateOptions,
} from './place-logo.types.ts'

export const DEFAULT_LOGO_TIMEOUT_MS = 9000

export function sanitizeLogoAvatar(value?: string | null): string | null {
  if (!value) return null
  const lower = value.toLowerCase()
  if (lower.includes('mapfiles/place_api/icons')) return null
  return value
}

export function usePlaceLogoState(
  place: Ref<PlaceLogoTarget | null>,
  options: UsePlaceLogoStateOptions = {}
): PlaceLogoState {
  const timeoutMs = options.timeoutMs ?? DEFAULT_LOGO_TIMEOUT_MS
  const autoHydrate = options.autoHydrate ?? true
  const basePriority = options.priority ?? false
  const emptyMessage = options.emptyMessage ?? null
  const shouldHydrate = options.shouldHydrate ?? defaultShouldHydrate

  const avatar = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasAttempted = ref(false)
  let requestToken = 0

  const canHydrate = computed(() => {
    const target = place.value
    if (!target) return false
    return shouldHydrate(target, avatar.value)
  })

  watch(
    place,
    (next: PlaceLogoTarget | null) => {
      requestToken += 1
      isLoading.value = false
      error.value = null
      const logoCandidate =
        (next as any)?.image_url ??
        (next as any)?.place_image ??
        (next as any)?.imageUrl ??
        null
      const sanitized = sanitizeLogoAvatar(logoCandidate)
      avatar.value = sanitized
      hasAttempted.value = !!sanitized
      if (!next) return
      if (
        autoHydrate &&
        typeof window !== 'undefined' &&
        shouldHydrate(next, sanitized)
      ) {
        Promise.resolve().then(() => {
          const current = place.value
          if (!current) return
          if (shouldHydrate(current, avatar.value)) {
            void hydrate()
          }
        })
      }
    },
    { immediate: true, deep: true }
  )

  async function hydrate(
    overrides: HydrateLogoOptions = {}
  ): Promise<string | null> {
    const target = place.value
    if (!target) return avatar.value

    if (!overrides.forceReload && !shouldHydrate(target, avatar.value)) {
      hasAttempted.value = !!avatar.value
      return avatar.value
    }

    const token = ++requestToken
    isLoading.value = true
    error.value = null

    const baseOptions: LoadLogoOptions = {
      timeoutMs: overrides.timeoutMs ?? timeoutMs,
      priority: overrides.priority ?? basePriority,
    }
    if (overrides.forceReload) {
      baseOptions.forceReload = true
    }

    try {
      const logo = await loadLogoForPlace(toLogoCard(target), baseOptions)
      if (token !== requestToken) return avatar.value
      const sanitized = sanitizeLogoAvatar(logo)

      avatar.value = sanitized
      hasAttempted.value = true
      error.value = sanitized
        ? null
        : (overrides.emptyMessage ?? emptyMessage ?? null)

      return avatar.value
    } catch (err) {
      if (token === requestToken) {
        hasAttempted.value = true
        error.value = formatLogoError(err)
      }
      return avatar.value
    } finally {
      if (token === requestToken) {
        isLoading.value = false
      }
    }
  }

  async function retry(
    overrides: HydrateLogoOptions = {}
  ): Promise<string | null> {
    return hydrate({
      ...overrides,
      forceReload: true,
      priority: overrides.priority ?? true,
    })
  }

  function cancel() {
    requestToken += 1
    isLoading.value = false
  }

  return {
    avatar,
    isLoading,
    error,
    hasAttempted,
    canHydrate,
    hydrate,
    retry,
    cancel,
  }
}

function defaultShouldHydrate(
  place: PlaceLogoTarget,
  currentAvatar: SanitizedAvatar
) {
  return place.source === 'google' && !currentAvatar
}

function formatLogoError(error: unknown): string {
  if (!error) return 'Logo fetch failed.'
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return 'Logo fetch failed.'
  }
}

export { cancelLogoRequests, loadLogoForPlace } from './place-logo-loader'
export type {
  HydrateLogoOptions,
  PlaceLogoState,
  UsePlaceLogoStateOptions,
} from './place-logo.types.ts'
