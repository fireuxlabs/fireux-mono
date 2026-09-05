import { useCookie, useState } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { normalizeString } from '../../../utils/string'
import type { WorkspaceOutcome } from './workspace-outcome'

export function normalizeWorkspace(value: unknown) {
  return normalizeString(value).toLowerCase()
}

export function useWorkspace(workspace: string) {
  const appId = normalizeWorkspace(useFireUXConfig().appId) || 'app'
  const workspaceId = normalizeWorkspace(workspace)
  const key = `fireux-workspace-${appId}-${workspaceId}`
  const cookie = useCookie<string>(key, {
    default: () => '',
    sameSite: 'lax',
  })
  const activeId = useState<string>(key, () => normalizeString(cookie.value))
  const select = (id: string) => {
    const value = normalizeString(id)
    activeId.value = value
    cookie.value = value
  }
  const reconcile = (
    availableIds: readonly string[],
    outcome: WorkspaceOutcome
  ) => {
    if (outcome !== 'ready' && outcome !== 'empty') return
    const ids = availableIds.map(normalizeString).filter(Boolean)
    if (ids.includes(activeId.value)) return
    const nextId = ids[0] || ''
    if (nextId !== activeId.value) select(nextId)
  }

  return {
    selectedId: computed(() => activeId.value),
    select,
    reconcile,
    clear: () => select(''),
  }
}
