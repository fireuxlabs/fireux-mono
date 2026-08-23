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
  const currentId = useState<string>(key, () => normalizeString(cookie.value))

  const setCurrent = (id: string) => {
    const value = normalizeString(id)
    currentId.value = value
    cookie.value = value
  }

  return {
    currentId: computed(() => currentId.value),
    setCurrent,
    clearCurrent: () => setCurrent(''),
  }
}
