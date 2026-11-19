import { navigateTo, useRoute, useRouter, useState } from '#imports'
import { isNavigationFailure } from 'vue-router'
import { toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import type { UseAppSessionReturn } from '../../app/composables/useAppSession'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useCommandScope } from '../../composables/fireux/commands/useCommandScope'
import type { ReadOutcome } from '../../utils/read-outcome'
import { workspaceSwitchPath } from '../utils/switch-route'
import type { useWorkspace } from './useWorkspace'
import type { WorkspaceRecordAccess } from './useWorkspaceRecord'

/** Keep the old selection until a record route has safely been left. */
export function useWorkspaceSwitch(
  family: string,
  selection: Pick<ReturnType<typeof useWorkspace>, 'selectedId' | 'select'>,
  {
    collection,
    collectionOutcome,
    access,
    session,
    homePath,
  }: {
    collection: Ref<readonly { id?: string }[]>
    collectionOutcome: Ref<ReadOutcome>
    access: WorkspaceRecordAccess
    session: Pick<UseAppSessionReturn, 'uid' | 'appUser'>
    homePath?: MaybeRefOrGetter<string>
  }
) {
  const config = useFireUXConfig()
  const route = useRoute()
  const router = useRouter()
  const request = useState(
    `workspace-switch:${config.appId}:${family}`,
    () => 0
  )
  const captureIntent = useCommandScope([
    request,
    session.uid,
    session.appUser,
    () => config.appId,
    selection.selectedId,
    access.ids,
    access.outcome,
    collectionOutcome,
  ])
  const canSelect = (id: string) =>
    access.outcome.value === 'ready' &&
    access.ids.value.includes(id) &&
    collectionOutcome.value === 'ready' &&
    collection.value.some((record) => record.id === id)

  return async (id: string) => {
    if (!canSelect(id)) return
    request.value += 1
    if (id === selection.selectedId.value) return

    const isCurrent = captureIntent()
    const destination = workspaceSwitchPath(
      route.matched.map((record) => record.path),
      router.getRoutes().map((record) => record.path),
      `/workspace/${family}`,
      toValue(homePath)
    )
    if (destination) {
      const failure = await navigateTo(destination, { replace: true })
      if (failure === false || isNavigationFailure(failure)) return
    }
    if (isCurrent() && canSelect(id)) selection.select(id)
  }
}
