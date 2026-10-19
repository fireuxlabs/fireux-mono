import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenWorkspacePlace } from '../identity/useKitchenWorkspacePlace'

export function useKitchenOverview() {
  const workspace = useKitchenWorkspace()
  const { place, placeOutcome } = useKitchenWorkspacePlace()
  const selectedKitchen = workspace.data
  const kitchenSource = computed(
    () => (selectedKitchen.value || {}) as Record<string, any>
  )
  const kitchenTitle = computed(
    () =>
      normalizeString(
        kitchenSource.value.presentation?.display_name ||
          kitchenSource.value.display_name ||
          kitchenSource.value.name ||
          place.value?.name ||
          place.value?.short_name
      ) || 'Kitchen'
  )
  const kitchenSubtitle = computed(
    () =>
      normalizeString(
        kitchenSource.value.presentation?.tagline || kitchenSource.value.tagline
      ) ||
      normalizeString(place.value?.tagline) ||
      normalizeString(place.value?.short_address) ||
      normalizeString(place.value?.formatted_address) ||
      normalizeString(kitchenSource.value.short_address) ||
      normalizeString(kitchenSource.value.formatted_address)
  )
  const identityImage = computed(() => normalizeString(place.value?.image_url))
  const pageState = computed(() => ({
    kitchen: selectedKitchen.value
      ? {
          id: workspace.id.value,
          name: kitchenTitle.value,
          description: kitchenSubtitle.value,
          image: identityImage.value,
        }
      : null,
    derived: {
      status: workspace.outcome.value,
      placeStatus: placeOutcome.value,
    },
  }))

  return {
    pageState,
    selectedKitchen,
    targetOutcome: workspace.outcome,
    kitchenTitle,
    kitchenSubtitle,
    identityImage,
  }
}
