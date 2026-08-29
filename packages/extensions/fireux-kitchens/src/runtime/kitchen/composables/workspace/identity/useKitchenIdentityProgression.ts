import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { readWorkspacePalette } from 'fireux-core/runtime/utils/brand-palette'
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
  const identityState = useKitchenWorkspaceIdentity()
  const placeState = useKitchenWorkspacePlace(identityState)
  const kitchen = computed(
    () => identityState.selectedKitchen.value as Record<string, unknown> | null
  )
  const identity = computed(() => identityState.selectedKitchen.value?.identity)
  const place = placeState.place
  const resolvedName = computed(
    () =>
      normalizeString(identity.value?.display_name) ||
      normalizeString(place.value?.name) ||
      normalizeString(place.value?.short_name)
  )
  const resolvedTagline = computed(
    () =>
      normalizeString(identity.value?.tagline) ||
      normalizeString(place.value?.brand_tagline)
  )
  const placeRequirements = computed<KitchenIdentityRequirement[]>(() =>
    identityState.placeId.value
      ? [
          {
            key: 'place',
            label: 'Linked Place',
            detail: 'The optional Place link resolves correctly.',
            complete: Boolean(place.value?.id),
          },
        ]
      : []
  )
  const placePercent = computed(() =>
    placeRequirements.value.length
      ? completionPercent(placeRequirements.value)
      : 100
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
      key: 'tagline',
      label: 'Tagline',
      detail: 'A Kitchen override or the linked Place tagline is available.',
      complete: Boolean(resolvedTagline.value),
    },
    {
      key: 'image',
      label: 'Image',
      detail: 'A Kitchen or inherited Place image can present the Kitchen.',
      complete: Boolean(identity.value?.image_url),
    },
  ])
  const rootPercent = computed(() => completionPercent(rootRequirements.value))
  const rootComplete = computed(() => rootPercent.value === 100)

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
  }
}

export type KitchenIdentityProgression = ReturnType<
  typeof useKitchenIdentityProgression
>
