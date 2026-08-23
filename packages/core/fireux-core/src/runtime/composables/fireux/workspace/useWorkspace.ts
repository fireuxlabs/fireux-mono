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
  const currentName = useState<string>(`${key}-current-name`, () => '')
  const currentDescription = useState<string>(
    `${key}-current-description`,
    () => ''
  )
  const currentImage = useState<string>(`${key}-current-image`, () => '')

  const setCurrent = (id: string, name = '', description = '', image = '') => {
    const value = normalizeString(id)
    const nextName = normalizeString(name)
    const nextDescription = normalizeString(description)
    const nextImage = normalizeString(image)
    currentId.value = value
    currentName.value = value ? nextName : ''
    currentDescription.value = value ? nextDescription : ''
    currentImage.value = value ? nextImage : ''
    cookie.value = value
  }

  return {
    currentId: computed(() => currentId.value),
    currentName: computed(() => currentName.value),
    currentDescription: computed(() => currentDescription.value),
    currentImage: computed(() => currentImage.value),
    setCurrent,
    clearCurrent: () => setCurrent(''),
  }
}
