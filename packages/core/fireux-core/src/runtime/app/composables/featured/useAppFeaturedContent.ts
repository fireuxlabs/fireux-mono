import { useRequireUser } from '../../../composables/fireux/firebase/useRequireUser'
// Concurrent edit — 2026-07-21 17:07 CEST — Dashboard Family pass: expose outcomes and enforce App-admin authority for field-level curation updates.
import { computed } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from '../config/FireUXConfig'
import { useFirestoreRead } from '../../../composables/fireux/firestore/operations/useFirestoreRead'
import { useUserSession } from '../../../user/composables/session/useUserSession'

export type AppFeaturedSlugField = `featured_${string}_slugs`

export type AppFeaturedContent = {
  id?: string
  featured_ecosystem_slugs?: string[]
  [key: AppFeaturedSlugField]: string[] | string | undefined
}

export function useAppFeaturedContent() {
  const fireux = useFireUXConfig()
  const { isAdmin, appUser } = useUserSession()
  const { currentUser } = useAuth()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    () => fireux.appId,
    isAdmin,
    appUser,
  ])
  const collectionPath = `apps/${fireux.appId}/settings`
  const { firestoreFetchDoc } = useFirestoreRead()
  const settings = firestoreFetchDoc<AppFeaturedContent>(
    collectionPath,
    'public'
  )

  const cleanList = (value: unknown) =>
    Array.isArray(value)
      ? value.map((entry) => String(entry ?? '').trim()).filter(Boolean)
      : []

  const featuredEcosystemSlugs = computed(() =>
    cleanList(settings.value?.featured_ecosystem_slugs)
  )
  const featuredSlugsFor = (domain: string) =>
    computed(() => cleanList(settings.value?.[`featured_${domain}_slugs`]))

  const updateFeaturedSlugs = async (
    field: AppFeaturedSlugField,
    values: unknown
  ) => {
    if (isAdmin.value !== true) {
      throw new Error('App admin access is required.')
    }

    const uid = currentUser.value?.uid,
      appId = fireux.appId
    const body = JSON.stringify({ field, values: cleanList(values) })
    const isCurrent = captureIntent()
    const assertCurrent = () => {
      if (!uid || !isCurrent() || !isAdmin.value)
        throw new Error('The App or account context changed. Please try again.')
    }
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid)
      throw new Error('The account context changed. Please try again.')
    const token = await user.getIdToken()
    assertCurrent()
    const response = await fetch('/api/internal/app/public-settings', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body,
    })
    if (!response.ok)
      throw new Error(
        `App public settings could not be updated (${response.status}).`
      )
    const result = await response.json()
    if (
      result?.ok !== true ||
      result.appId !== appId ||
      result.field !== field ||
      !Array.isArray(result.values)
    )
      throw new Error(
        'App public settings response did not match the requested field.'
      )
  }

  return {
    collectionPath,
    settings,
    pending: settings.pending,
    error: settings.error,
    outcome: settings.outcome,
    featuredEcosystemSlugs,
    featuredSlugsFor,
    canUpdate: isAdmin,
    updateFeaturedSlugs,
    captureIntent,
  }
}
