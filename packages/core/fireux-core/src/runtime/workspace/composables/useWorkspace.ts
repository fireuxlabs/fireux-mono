import { useCookie, useState } from '#imports'
import { computed, watch } from 'vue'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { normalizeString } from '../../utils/string'
import type { WorkspaceOutcome } from '../models/outcome'

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
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  const activeId = useState<string>(key, () => normalizeString(cookie.value))
  // useCookie returns a component-scoped ref. Keep every mounted copy current,
  // including copies that flush their cookie when their component is disposed.
  if (cookie.value !== activeId.value) cookie.value = activeId.value
  watch(
    activeId,
    (id) => {
      cookie.value = id
    },
    { flush: 'sync' }
  )
  // Nuxt refreshes this ref when the cookie changes in another tab. Adopt that
  // selection before an older tab can write its stale in-memory value back.
  watch(
    cookie,
    (id) => {
      const value = normalizeString(id)
      if (value !== activeId.value) activeId.value = value
    },
    { flush: 'sync' }
  )
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
