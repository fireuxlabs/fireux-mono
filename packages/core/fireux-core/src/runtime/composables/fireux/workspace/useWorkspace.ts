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
  const activeName = useState<string>(`${key}-current-name`, () => '')
  const activeDescription = useState<string>(
    `${key}-current-description`,
    () => ''
  )
  const activeImage = useState<string>(`${key}-current-image`, () => '')

  const activate = (id: string, name = '', description = '', image = '') => {
    const value = normalizeString(id)
    const nextName = normalizeString(name)
    const nextDescription = normalizeString(description)
    const nextImage = normalizeString(image)
    activeId.value = value
    activeName.value = value ? nextName : ''
    activeDescription.value = value ? nextDescription : ''
    activeImage.value = value ? nextImage : ''
    cookie.value = value
  }

  return {
    activeId: computed(() => activeId.value),
    activeName: computed(() => activeName.value),
    activeDescription: computed(() => activeDescription.value),
    activeImage: computed(() => activeImage.value),
    activate,
    clearActive: () => activate(''),
  }
}
