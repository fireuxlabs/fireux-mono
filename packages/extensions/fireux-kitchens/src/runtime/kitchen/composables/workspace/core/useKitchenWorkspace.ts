import { computed, watch, watchEffect } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import type { KitchenSurface } from '../../firestore/utils/view/useKitchenInterface'
import { useKitchenWorkspaceKitchens } from '../index/useKitchenWorkspaceKitchens'
import { useKitchenCreate } from '../../firestore/mutations/useKitchenCreate'
import { useKitchenDelete } from '../../firestore/mutations/useKitchenDelete'
import { useKitchenUpdate } from '../../firestore/mutations/useKitchenUpdate'

export function useKitchenWorkspace() {
  const workspace = useWorkspace('kitchen')
  const { currentUser } = useAuth()
  const kitchens = useKitchenWorkspaceKitchens()
  const kitchenId = workspace.selectedId
  const { createKitchen } = useKitchenCreate()
  const { updateKitchen } = useKitchenUpdate()
  const { deleteKitchen } = useKitchenDelete()
  const kitchen = computed<KitchenSurface | null>(
    () =>
      kitchens.kitchens.value.find(
        (item) => normalizeString(item.id) === kitchenId.value
      ) ?? null
  )

  watch(
    [kitchens.primaryKitchenId, kitchens.kitchens],
    ([primaryKitchenId, targets]: [string, KitchenSurface[]]) => {
      const primaryKitchen = targets.find(
        (item) => normalizeString(item.id) === normalizeString(primaryKitchenId)
      )
      if (!primaryKitchen) {
        if (!primaryKitchenId) workspace.clear()
        return
      }
      workspace.select(normalizeString(primaryKitchen.id))
    },
    { immediate: true }
  )

  watch(
    kitchen,
    (selectedKitchen: KitchenSurface | null) => {
      if (!selectedKitchen) return
      workspace.select(normalizeString(selectedKitchen.id))
    },
    { immediate: true }
  )

  watch(
    [kitchenId, kitchen, kitchens.outcome],
    (values: [string, unknown, string]) => {
      const [id, activeEntity, outcome] = values
      if (!id || activeEntity || (outcome !== 'ready' && outcome !== 'empty'))
        return
      workspace.clear()
    },
    { immediate: true }
  )

  const outcome = computed(() => {
    if (kitchens.outcome.value === 'pending') return 'pending' as const
    if (kitchens.outcome.value === 'error') return 'error' as const
    if (!kitchenId.value) return kitchens.outcome.value
    return kitchen.value ? ('ready' as const) : ('missing' as const)
  })

  watchEffect(() => {
    workspace.setChoices(
      kitchens.kitchens.value.map((item) => ({
        id: normalizeString(item.id),
        name: normalizeString(item.identity?.display_name),
        description: normalizeString(item.identity?.tagline),
        image: normalizeString(item.identity?.image_url),
      }))
    )
  })

  async function select(id: string) {
    const requestedId = normalizeString(id)
    if (!requestedId) {
      workspace.clear()
      return
    }
    const user = currentUser.value
    if (!user) throw new Error('Sign in to select a Kitchen.')
    await $fetch('/api/workspace/kitchen/request-primary-change', {
      method: 'POST',
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      body: { kitchenId: requestedId },
    })
  }

  return {
    data: kitchen,
    choices: workspace.choices,
    selectedId: workspace.selectedId,
    select,
    outcome,
    create: createKitchen,
    update: (changes: Parameters<typeof updateKitchen>[0]['changes']) =>
      updateKitchen({ kitchenId: kitchenId.value, changes }),
    delete: () => deleteKitchen(kitchenId.value),
  }
}
