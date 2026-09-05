import { useCookie, useState } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { normalizeString } from '../../../utils/string'

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

  return {
    selectedId: computed(() => activeId.value),
    select,
    clear: () => select(''),
  }
}
