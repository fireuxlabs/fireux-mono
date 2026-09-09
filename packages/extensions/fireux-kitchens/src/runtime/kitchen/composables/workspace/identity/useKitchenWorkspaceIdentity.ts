import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenWorkspace } from '../useKitchenWorkspace'

export function useKitchenWorkspaceIdentity() {
  const workspace = useKitchenWorkspace()
  const session = useAppSession()
  const { currentUser } = useAuth()
  const record = computed(
    () => workspace.data.value as Record<string, unknown> | null
  )
  const identity = computed(
    () => record.value?.identity as Record<string, unknown> | undefined
  )

  const name = computed(() => normalizeString(identity.value?.display_name))
  const tagline = computed(() => normalizeString(identity.value?.tagline))
  const imageUrl = computed(() => normalizeString(identity.value?.image_url))
  const slug = computed(() => normalizeString(record.value?.slug))
  const address = computed(() =>
    normalizeString(
      record.value?.short_address || record.value?.formatted_address
    )
  )

  return {
    selectedKitchen: workspace.data,
    kitchenId: workspace.id,
    outcome: workspace.outcome,
    canWrite: computed(
      () =>
        Boolean(currentUser.value && session.appUser.value?.kitchens?.includes(workspace.id.value)) &&
        workspace.outcome.value === 'ready'
    ),
    update: workspace.crud.update,
    name,
    tagline,
    imageUrl,
    slug,
    address,
  }
}

export type KitchenWorkspaceIdentityState = ReturnType<
  typeof useKitchenWorkspaceIdentity
>
