import { useAsyncData } from 'nuxt/app'

import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
type Member = { id?: string; memberId?: string; name: string; avatar: string }
import { useKitchenIdentityProjection } from '../useKitchenIdentity'
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/normalize-string'
import { useKitchenWorkspace } from './useKitchenWorkspace'

export function useKitchenWorkspaceHome() {
  const workspace = useKitchenWorkspace()
  const { place, placeOutcome } = useKitchenIdentityProjection(workspace)
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

  const { currentUser } = useAuth()
  const key = computed(
    () =>
      `kitchen-team-summary-${currentUser.value?.uid || ''}-${workspace.id.value}-${workspace.outcome.value}`
  )
  const { data, status, error } = useAsyncData(
    key,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      const id = workspace.outcome.value === 'ready' ? workspace.id.value : ''
      const user = currentUser.value
      if (!id || !user) return null
      return fetchRead<{ kitchenId: string; members: Member[] }>(
        '/api/workspace/kitchen/team/members',
        {
          query: { kitchenId: id },
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    { server: false }
  )
  const team = {
    members: computed(() =>
      workspace.outcome.value === 'ready' &&
      !error.value &&
      status.value === 'success' &&
      data.value &&
      data.value.kitchenId === workspace.id.value
        ? data.value.members
        : []
    ),
    pending: computed(
      () => status.value === 'pending' || status.value === 'idle'
    ),
    error,
  }
  return {
    team,
    pageState,
    selectedKitchen,
    targetOutcome: workspace.outcome,
    kitchenTitle,
    kitchenSubtitle,
    identityImage,
  }
}
