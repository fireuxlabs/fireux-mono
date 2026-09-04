import { computed, type Ref } from 'vue'
import type { App } from '../models/app.model'
import { useAppUpdate } from './useAppUpdate'

const text = (value: unknown, max: number) =>
  String(value ?? '').trim().slice(0, max)

export function useAppSettings(app: Ref<App | null | undefined>) {
  const { updateApp } = useAppUpdate(computed(() => app.value?.id || ''))

  const updateDescription = (value: string) => updateApp({ description: text(value, 500) })
  const updateTagline = (value: string) => updateApp({ tagline: text(value, 160) })
  const updateShortBio = (value: string) => updateApp({ short_bio: text(value, 280) })
  const updateLongBio = (value: string) => updateApp({ long_bio: text(value, 4000) })
  const updateAppName = (value: string) => updateApp({ name: text(value, 60) })
  const updateAppShortName = (value: string) => updateApp({ short_name: text(value, 40) })
  const updateSocialLinks = (value: App['social_links']) => updateApp({ social_links: value })

  return {
    updateDescription,
    updateTagline,
    updateShortBio,
    updateLongBio,
    updateAppName,
    updateAppShortName,
    updateSocialLinks,
  }
}
