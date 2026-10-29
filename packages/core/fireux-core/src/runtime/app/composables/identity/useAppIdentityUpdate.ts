import { refreshNuxtData } from 'nuxt/app'
import type { Ref } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import type { App } from '../../models/app.model'
import { useRequireUser } from '../../../composables/fireux/firebase/useRequireUser'
import { useFireUXConfig } from '../config/FireUXConfig'

/** Edit the configured App through its trusted settings command. */
export function useAppIdentityUpdate(app: Ref<App | null | undefined>) {
  const config = useFireUXConfig()
  const { currentUser } = useAuth()
  const capture = useCommandScope([
    () => currentUser.value?.uid,
    () => config.appId,
    () => app.value?.id,
  ])
  async function updateSettings(changes: Record<string, unknown>) {
    if (!app.value || app.value.id !== config.appId) {
      throw new Error('Settings must target the current runtime App.')
    }
    const uid = currentUser.value?.uid
    const appId = config.appId
    const body = JSON.stringify(changes)
    const isCurrent = capture()
    const assertCurrent = () => {
      if (!uid || !isCurrent())
        throw new Error('The App or account context changed. Please try again.')
    }
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid)
      throw new Error('The account context changed. Please try again.')
    const token = await user.getIdToken()
    assertCurrent()
    const response = await fetch('/api/internal/app/settings', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body,
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(
        payload?.statusMessage || 'App settings could not be saved.'
      )
    }
    if (payload?.ok !== true || payload.appId !== appId) {
      throw new Error('App settings response did not match the requested App.')
    }
    if (isCurrent())
      await refreshNuxtData(JSON.stringify(['app-read', appId, uid]))
  }
  return {
    captureIntent: capture,
    updateWebsite: (website: string) =>
      updateSettings({ 'social_links.website': website }),
    updateDescription: (description: string) => updateSettings({ description }),
    updateTagline: (tagline: string) => updateSettings({ tagline }),
    updateAppName: (name: string) => updateSettings({ name }),
    updateAppShortName: (short_name: string) => updateSettings({ short_name }),
    updateSocialLinks: (social_links: App['social_links']) =>
      updateSettings({ social_links }),
  }
}
