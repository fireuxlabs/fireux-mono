import type { ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import { computed, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/utils/app-user-access'
import { useState, useRoute, useRouter, navigateTo } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  useWorkspace,
  defineWorkspace,
} from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useKitchenCollection } from '../useKitchenCollection'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import { kitchenWorkspaceSwitchPath } from '../../utils/workspace-switch-route'
import { useKitchenInterface } from '../useKitchenInterface'
import { useKitchenRead } from '../useKitchenRead'

export const useKitchenWorkspace = defineWorkspace(() => {
  const { appId } = useFireUXConfig()
  const adoptedSelection = useState(
    `kitchen-adopted-selection:${appId}`,
    () => ''
  )
  const selectionIntent = useState<number>(
    `kitchen-selection-intent:${appId}`,
    () => 0
  )
  const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
  const route = useRoute()
  const router = useRouter()
  const selection = useWorkspace('kitchen')
  const targets = useKitchenCollection()
  const session = useAppSession()
  const captureIntent = useCommandScope([
    session.uid,
    session.appUser,
    selection.selectedId,
    targets.outcome,
    selectionIntent,
  ])
  const canSelect = (id: string) =>
    targets.outcome.value === 'ready' &&
    targets.kitchens.value.some((kitchen) => kitchen.id === id)
  // Presentation only: retained associations and selection are never truncated.
  const multipleKitchenView = computed(
    () =>
      !session.pending.value &&
      !session.error.value &&
      resolveAppUserAccess(session.appUser.value).hasBusinessSubscription
  )

  watch(
    [
      targets.kitchens,
      targets.outcome,
      selection.selectedId,
      adoptedSelection,
      () => route.query.kitchenId,
    ],
    () => {
      const ids = targets.kitchens.value.map((kitchen) => kitchen.id || '')
      const requestedId =
        typeof route.query.kitchenId === 'string' ? route.query.kitchenId : ''
      if (
        route.meta.workspace === 'kitchen' &&
        requestedId &&
        targets.outcome.value === 'ready' &&
        ids.includes(requestedId)
      ) {
        selection.select(requestedId)
        const { kitchenId: _requested, ...query } = route.query
        void navigateTo(
          { path: route.path, query, hash: route.hash },
          { replace: true }
        )
        return
      }
      if (
        targets.outcome.value === 'ready' &&
        ids.includes(adoptedSelection.value)
      ) {
        selection.select(adoptedSelection.value)
        adoptedSelection.value = ''
      } else selection.reconcile(ids, targets.outcome.value)
    },
    { immediate: true }
  )

  // Opening a Workspace is local selection, not an account-primary mutation.

  const id = selection.selectedId
  const access = targets.access
  const readId = computed(() =>
    access.outcome.value === 'ready' && access.ids.value.includes(id.value)
      ? id.value
      : ''
  )
  const source = useKitchenRead(readId)
  const { kitchen, place } = source
  const outcome = computed<ReadOutcome>(() => {
    if (access.outcome.value !== 'ready') return access.outcome.value
    if (!id.value) return 'idle'
    if (!readId.value) return 'empty'
    if (source.outcome.value === 'ready' && kitchen.value?.id !== readId.value)
      return 'pending'
    return source.outcome.value
  })
  const { surface } = useKitchenInterface()
  const data = computed(() =>
    outcome.value === 'ready' && kitchen.value?.id === readId.value
      ? surface({
          kitchen: kitchen.value,
          place: place.value,
          routeScope: 'live',
        })
      : null
  )

  return {
    data,
    root: computed(() =>
      readId.value && source.root.value?.id === readId.value
        ? source.root.value
        : null
    ),
    place: computed(() =>
      outcome.value === 'ready' && place.value?.id === readId.value
        ? place.value
        : null
    ),
    placeOutcome: computed(() =>
      outcome.value === 'ready' ? source.placeOutcome.value : outcome.value
    ),
    id,
    outcome,
    collection: targets.kitchens,
    multipleKitchenView,
    collectionOutcome: targets.outcome,
    select: async (id: string) => {
      if (!canSelect(id)) return
      selectionIntent.value += 1
      if (id === selection.selectedId.value) return
      const isCurrent = captureIntent()
      const destination = kitchenWorkspaceSwitchPath(
        route.matched.map((record: { path: string }) => record.path),
        router.getRoutes().map((record: { path: string }) => record.path),
        workspaceEntryPath.value
      )
      if (destination) await navigateTo(destination, { replace: true })
      if (isCurrent() && canSelect(id)) selection.select(id)
    },
  }
})
