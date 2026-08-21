import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  readKitchenManagementTarget,
} from '../../../utils/kitchen-spine'
import { readKitchenPresentationIdentity } from '../../../utils/kitchen-presentation'
import { readWorkspacePalette } from 'fireux-core/runtime/utils/brand-palette'
import { readPlacePresentation } from 'fireux-places/runtime/place/utils/place-spine'
import { useKitchenWorkspaceIdentity } from './useKitchenWorkspaceIdentity'
import { useKitchenWorkspacePlace } from './useKitchenWorkspacePlace'

export type KitchenIdentityRequirement = {
  key: string
  label: string
  detail: string
  complete: boolean
}

const completionPercent = (requirements: KitchenIdentityRequirement[]) => {
  if (!requirements.length) return 0
  const complete = requirements.filter(
    (requirement) => requirement.complete
  ).length
  return Math.round((complete / requirements.length) * 100)
}

/**
 * Kitchen identity follows the same Place → Kitchen → Workspace → App authority
 * used by onboarding. Each layer stores only its own additions or overrides.
 */
export function useKitchenIdentityProgression() {
  const fireux = useFireUXConfig()
  const identityState = useKitchenWorkspaceIdentity()
  const placeState = useKitchenWorkspacePlace(identityState)
  const kitchen = computed(
    () => identityState.selectedKitchen.value as Record<string, unknown> | null
  )
  const identity = computed(() => readKitchenPresentationIdentity(kitchen.value))
  const place = placeState.place
  const placePresentation = computed(() => readPlacePresentation(place.value))
  const resolvedName = computed(
    () =>
      normalizeString(identity.value.displayName) ||
      normalizeString(place.value?.name) ||
      normalizeString(place.value?.short_name)
  )
  const resolvedTagline = computed(
    () =>
      normalizeString(identity.value.tagline) ||
      normalizeString(place.value?.brand_tagline)
  )
  const placeRequirements = computed<KitchenIdentityRequirement[]>(() => [
    {
      key: 'place',
      label: 'Linked Place',
      detail: 'The Kitchen resolves its physical identity from one Place.',
      complete: Boolean(identityState.placeId.value && place.value?.id),
    },
    {
      key: 'place-name',
      label: 'Place name',
      detail: 'The linked Place has its canonical name.',
      complete: Boolean(placePresentation.value.name),
    },
    {
      key: 'place-backdrop',
      label: 'Identity backdrop',
      detail: 'Transparent identity media has a deliberate base colour.',
      complete: Boolean(placePresentation.value.mediaBackdropColor),
    },
  ])
  const placePercent = computed(() =>
    completionPercent(placeRequirements.value)
  )
  const placeComplete = computed(() => placePercent.value === 100)

  const rootRequirements = computed<KitchenIdentityRequirement[]>(() => [
    {
      key: 'name',
      label: 'Name',
      detail: 'A Kitchen override or the linked Place name is available.',
      complete: Boolean(resolvedName.value),
    },
    {
      key: 'slug',
      label: 'Slug',
      detail: 'The Kitchen has a stable route identifier.',
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
      label: 'Logo',
      detail: 'A Kitchen override or inherited Place logo is available.',
      complete: Boolean(
        identity.value.logoImageUrl || placePresentation.value.logoImage
      ),
    },
    {
      key: 'wordmark',
      label: 'Wordmark',
      detail: 'A Kitchen override or inherited Place wordmark is available.',
      complete: Boolean(
        identity.value.wordmarkImageUrl || placePresentation.value.wordmarkImage
      ),
    },
  ])
  const rootPercent = computed(() =>
    placeComplete.value ? completionPercent(rootRequirements.value) : 0
  )
  const rootComplete = computed(
    () => placeComplete.value && rootPercent.value === 100
  )

  const storedWorkspacePalette = computed(() =>
    readWorkspacePalette(
      (kitchen.value?.workspace_theme as Record<string, unknown> | undefined)
        ?.palette
    )
  )
  const workspaceRequirements = computed<KitchenIdentityRequirement[]>(() => [
    {
      key: 'menu-style',
      label: 'Menu display theme',
      detail: 'The Workspace has saved its four functional colours.',
      complete: Boolean(storedWorkspacePalette.value),
    },
  ])
  const workspacePercent = computed(() =>
    rootComplete.value ? completionPercent(workspaceRequirements.value) : 0
  )
  const workspaceComplete = computed(
    () => rootComplete.value && workspacePercent.value === 100
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
  ])
  const appPercent = computed(() =>
    workspaceComplete.value ? completionPercent(appRequirements.value) : 0
  )

  return {
    ...identityState,
    place,
    placePending: placeState.pending,
    placeRequirements,
    placePercent,
    placeComplete,
    kitchen,
    rootRequirements,
    rootPercent,
    rootComplete,
    workspaceRequirements,
    workspacePercent,
    workspaceComplete,
    appRequirements,
    appPercent,
    appComplete: computed(() => appPercent.value === 100),
    hasDedicatedApp: computed(() => management.value.hasDedicatedApp),
    managementMode: computed(() => management.value.mode),
  }
}

export type KitchenIdentityProgression = ReturnType<
  typeof useKitchenIdentityProgression
>
