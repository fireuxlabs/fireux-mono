import { computed, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useState, useRoute, useRouter, navigateTo } from '#imports'
import { propertyWorkspaceSwitchPath } from '../../utils/workspace-switch-route'
import {
  useWorkspace,
  defineWorkspace,
} from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { usePropertyCollection } from '../usePropertyCollection'
import { usePropertyAccess } from '../usePropertyAccess'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/workspace/models/outcome'
import { usePropertyFetch } from '../firestore/fetch/usePropertyFetch'

export const usePropertyWorkspace = defineWorkspace(() => {
  const selection = useWorkspace('property')
  const route = useRoute()
  const router = useRouter()
  const access = usePropertyAccess()
  const properties = usePropertyCollection({
    filter: computed(() => ({ ids: access.ids.value })),
  })
  const collectionOutcome = computed(() =>
    access.outcome.value === 'pending' || access.outcome.value === 'error'
      ? access.outcome.value
      : properties.outcome.value
  )
  const session = useAppSession()
  const config = useFireUXConfig()
  const selectionRequest = useState<number>(
    `property-selection-request:${config.appId}`,
    () => 0
  )
  const captureIntent = useCommandScope([
    selectionRequest,
    session.uid,
    session.appUser,
    () => config.appId,
    selection.selectedId,
    access.ids,
    collectionOutcome,
  ])
  const canSelect = (id: string) =>
    collectionOutcome.value === 'ready' &&
    properties.properties.value.some((property) => property.id === id)

  watch(
    [properties.properties, collectionOutcome, selection.selectedId],
    () =>
      selection.reconcile(
        properties.properties.value.flatMap((property) =>
          property.id ? [property.id] : []
        ),
        collectionOutcome.value
      ),
    { immediate: true }
  )

  const id = selection.selectedId
  const readId = computed(() =>
    access.outcome.value === 'ready' && access.ids.value.includes(id.value)
      ? id.value
      : ''
  )
  const source = usePropertyFetch(readId)
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (access.outcome.value !== 'ready') return access.outcome.value
    if (!id.value) return 'idle'
    if (!readId.value) return 'missing'
    if (
      source.outcome.value === 'ready' &&
      source.property.value?.id !== readId.value
    )
      return 'pending'
    return source.outcome.value
  })
  const data = computed(() =>
    outcome.value === 'ready' && source.property.value?.id === readId.value
      ? source.property.value
      : null
  )

  return {
    data,
    id,
    outcome,
    collectionOutcome,
    collection: properties.properties,
    select: async (id: string) => {
      if (!canSelect(id)) return
      selectionRequest.value += 1
      if (id === selection.selectedId.value) return
      const isCurrent = captureIntent()
      const destination = propertyWorkspaceSwitchPath(
        route.matched.map((record: { path: string }) => record.path),
        router.getRoutes().map((record: { path: string }) => record.path)
      )
      if (destination) await navigateTo(destination, { replace: true })
      if (isCurrent() && canSelect(id)) selection.select(id)
    },
  }
})
