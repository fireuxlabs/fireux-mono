import { computed } from 'vue'
import { useFireUXConfig } from './FireUXConfig'
import { useFirestoreRead } from '../firestore/operations/useFirestoreRead'

export type AppPublicSettings = {
  id?: string
  featured_app_slugs?: string[]
  featured_ecosystem_slugs?: string[]
}

export function useAppPublicSettings() {
  const fireux = useFireUXConfig()
  const collectionPath = `apps/${fireux.appId}/settings`
  const { firestoreFetchDoc } = useFirestoreRead()
  const settings = firestoreFetchDoc<AppPublicSettings>(collectionPath, 'public')

  const cleanList = (value: unknown) =>
    Array.isArray(value)
      ? value.map((entry) => String(entry ?? '').trim()).filter(Boolean)
      : []

  const featuredAppSlugs = computed(() =>
    cleanList(settings.value?.featured_app_slugs)
  )
  const featuredEcosystemSlugs = computed(() =>
    cleanList(settings.value?.featured_ecosystem_slugs)
  )

  return {
    collectionPath,
    settings,
    featuredAppSlugs,
    featuredEcosystemSlugs,
  }
}
