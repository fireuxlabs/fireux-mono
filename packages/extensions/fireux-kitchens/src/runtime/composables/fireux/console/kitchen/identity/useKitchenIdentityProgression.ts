import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  readKitchenIdentity,
  readKitchenManagementTarget,
  readKitchenMenuStyle,
} from '../../../../../utils/kitchen-spine'
import { useKitchenConsoleIdentity } from './useKitchenConsoleIdentity'
import { useKitchenConsolePlace } from './useKitchenConsolePlace'

export type KitchenIdentityRequirement = {
  key: string
  label: string
  detail: string
  complete: boolean
}

const completionPercent = (requirements: KitchenIdentityRequirement[]) => {
  if (!requirements.length) return 0
  const complete = requirements.filter(requirement => requirement.complete).length
  return Math.round((complete / requirements.length) * 100)
}

/**
 * Kitchen identity is progressive authority, not three interchangeable themes.
 * Root identity must resolve before Console presentation can be authored. App
 * Brand System work remains downstream of both and must not be simulated here.
 */
export function useKitchenIdentityProgression() {
  const fireux = useFireUXConfig()
  const identityState = useKitchenConsoleIdentity()
  const placeState = useKitchenConsolePlace(identityState)
  const kitchen = computed(
    () => identityState.selectedKitchen.value as Record<string, unknown> | null
  )
  const identity = computed(() => readKitchenIdentity(kitchen.value))
  const place = placeState.place
  const resolvedName = computed(() =>
    normalizeString(identity.value.displayName) ||
    normalizeString(place.value?.name) ||
    normalizeString(place.value?.short_name)
  )
  const resolvedTagline = computed(() =>
    normalizeString(identity.value.tagline) ||
    normalizeString(place.value?.brand_tagline)
  )
  const resolvedBackdrop = computed(() =>
    normalizeString(identity.value.mediaBackdropColor) ||
    normalizeString(place.value?.media_backdrop_color)
  )

  const rootRequirements = computed<KitchenIdentityRequirement[]>(() => [
    {
      key: 'place',
      label: 'Linked Place',
      detail: 'The Kitchen resolves its physical identity from one Place.',
      complete: Boolean(identityState.placeId.value && place.value?.id),
    },
    {
      key: 'name',
      label: 'Name',
      detail: 'A Kitchen override or the linked Place name is available.',
      complete: Boolean(resolvedName.value),
    },
    {
      key: 'slug',
      label: 'Slug',
      detail: 'The Kitchen has a stable public identifier.',
      complete: Boolean(identityState.slug.value),
    },
    {
      key: 'tagline',
      label: 'Tagline',
      detail: 'A Kitchen override or the linked Place tagline is available.',
      complete: Boolean(resolvedTagline.value),
    },
    {
      key: 'logo',
      label: 'Kitchen logo',
      detail: 'Console targets use Kitchen-owned identity, not Place photography.',
      complete: Boolean(identity.value.logoImageUrl),
    },
    {
      key: 'wordmark',
      label: 'Kitchen wordmark',
      detail: 'A Kitchen-owned transparent wordmark is available.',
      complete: Boolean(identity.value.wordmarkImageUrl),
    },
    {
      key: 'backdrop',
      label: 'Media backdrop',
      detail: 'Transparent identity media resolves against a deliberate colour.',
      complete: Boolean(resolvedBackdrop.value),
    },
  ])
  const rootPercent = computed(() => completionPercent(rootRequirements.value))
  const rootComplete = computed(() => rootPercent.value === 100)

  const storedMenuStyle = computed(() => readKitchenMenuStyle(kitchen.value))
  const consoleRequirements = computed<KitchenIdentityRequirement[]>(() => [
    {
      key: 'menu-style',
      label: 'Menu display theme',
      detail: 'The Console has saved its portable PageStyle colours.',
      complete: Boolean(
        normalizeString(storedMenuStyle.value?.primary_color) &&
        normalizeString(storedMenuStyle.value?.secondary_color)
      ),
    },
  ])
  const consolePercent = computed(() =>
    rootComplete.value ? completionPercent(consoleRequirements.value) : 0
  )
  const consoleComplete = computed(
    () => rootComplete.value && consolePercent.value === 100
  )

  const management = computed(() =>
    readKitchenManagementTarget(kitchen.value, fireux.ecosystem)
  )
  const appRequirements = computed<KitchenIdentityRequirement[]>(() => [
    {
      key: 'app',
      label: 'App attached',
      detail: 'The Kitchen is managed by a dedicated tenant App.',
      complete: management.value.hasDedicatedApp,
    },
    {
      key: 'brand-system',
      label: 'App Brand System',
      detail: 'Stored Brand System authoring is not implemented yet.',
      complete: false,
    },
  ])
  const appPercent = computed(() =>
    consoleComplete.value ? completionPercent(appRequirements.value) : 0
  )

  return {
    ...identityState,
    place,
    placePending: placeState.pending,
    kitchen,
    rootRequirements,
    rootPercent,
    rootComplete,
    consoleRequirements,
    consolePercent,
    consoleComplete,
    appRequirements,
    appPercent,
    appComplete: computed(() => appPercent.value === 100),
  }
}

export type KitchenIdentityProgression = ReturnType<
  typeof useKitchenIdentityProgression
>
