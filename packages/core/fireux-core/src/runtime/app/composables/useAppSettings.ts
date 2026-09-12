import type { Ref } from 'vue'
import type { App } from '../models/app.model'
import { useRequireUser } from '../../composables/fireux/firebase/useRequireUser'
import { useFireUXConfig } from './config/FireUXConfig'

/** Edit the configured App through its trusted settings command. */
export function useAppSettings(app: Ref<App | null | undefined>) {
  const { appId } = useFireUXConfig()
  async function updateSettings(changes: Record<string, unknown>) {
    if (!app.value || app.value.id !== appId) {
      throw new Error('Settings must target the current runtime App.')
    }
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const response = await fetch('/api/internal/app/settings', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(changes),
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      throw new Error(
        payload?.statusMessage || 'App settings could not be saved.'
      )
    }
  }
  return {
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
