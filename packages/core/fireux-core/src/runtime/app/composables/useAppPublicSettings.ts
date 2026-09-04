// Concurrent edit — 2026-07-21 17:07 CEST — Dashboard Family pass: expose outcomes and enforce App-admin authority for field-level curation updates.
import { computed } from 'vue'
import { useFireUXConfig } from './config/FireUXConfig'
import { useFirestoreRead } from '../../composables/fireux/firestore/operations/useFirestoreRead'
import { useUser } from '../../user/composables/useUser'

export type AppFeaturedSlugField = `featured_${string}_slugs`

export type AppPublicSettings = {
  id?: string
  featured_app_slugs?: string[]
  featured_ecosystem_slugs?: string[]
  [key: AppFeaturedSlugField]: string[] | string | undefined
}

export function useAppPublicSettings() {
  const fireux = useFireUXConfig()
  const { isAdmin } = useUserSession()
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
  const featuredSlugsFor = (domain: string) =>
    computed(() =>
      cleanList(settings.value?.[`featured_${domain}_slugs`])
    )

  const updateFeaturedSlugs = async (
    field: AppFeaturedSlugField,
    values: unknown
  ) => {
    if (isAdmin.value !== true) {
      throw new Error('App admin access is required.')
    }

    const response = await fetch('/api/internal/app/public-settings', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ field, values: cleanList(values) }),
    })
    if (!response.ok)
      throw new Error(`App public settings could not be updated (${response.status}).`)
  }

  return {
    collectionPath,
    settings,
    pending: settings.pending,
    error: settings.error,
    outcome: settings.outcome,
    featuredAppSlugs,
    featuredEcosystemSlugs,
    featuredSlugsFor,
    canUpdate: isAdmin,
    updateFeaturedSlugs,
  }
}
