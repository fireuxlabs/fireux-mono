import { refreshNuxtData } from 'nuxt/app'
import type { WatchSource } from 'vue'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import { useKitchenAccess } from '../useKitchenAccess'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { seedSproochliText } from 'fireux-sproochli/runtime/utils/translation-seed'
import type {
  KitchenPrepItemInput,
  KitchenPrepItemUnit,
} from '../../utils/prep-item'

type KitchenPrepItemCreateDraft = {
  name: string
  description?: string
  station?: string
  inputs?: KitchenPrepItemInput[]
  recipe_id?: string
  yield?: { quantity?: number; unit?: KitchenPrepItemUnit }
  method?: string[]
  names?: unknown
  descriptions?: unknown
}

type KitchenPrepItemCreateOptions = {
  sourceLanguage?: string
}

export function useKitchenPrepItemCreate(ownerSources: WatchSource[] = []) {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const access = useKitchenAccess()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    () => config.appId,
    () => JSON.stringify(appUser.value),
    appPending,
    appError,
    appOutcome,
    () => JSON.stringify(access.ids.value),
    () => access.outcome.value,
    ...ownerSources,
  ])
  const createPrepItem = async (
    draft: KitchenPrepItemCreateDraft,
    target: { kitchenId: string },
    createOptions: KitchenPrepItemCreateOptions = {}
  ) => {
    const kitchenId = String(target.kitchenId || '').trim()
    if (!kitchenId) throw new Error('Kitchen id is required')
    const captured = JSON.parse(
      JSON.stringify(draft)
    ) as KitchenPrepItemCreateDraft
    const options = JSON.parse(
      JSON.stringify(createOptions)
    ) as KitchenPrepItemCreateOptions
    const isCurrent = captureIntent(),
      uid = currentUser.value?.uid
    const assertScope = () => {
      if (
        !uid ||
        currentUser.value?.uid !== uid ||
        !isCurrent() ||
        appPending.value ||
        appError.value ||
        appOutcome.value !== 'ready' ||
        access.outcome.value !== 'ready'
      )
        throw new Error(
          'The account or Kitchen changed. Reopen the Prep Item editor.'
        )
    }
    assertScope()
    const name = String(captured.name ?? '').trim(),
      description = String(captured.description ?? '').trim()
    const nameSeed = seedSproochliText({
      text: name,
      sourceLanguage: options.sourceLanguage,
      existingText: captured.names,
    })
    assertScope()
    const descriptionSeed = description
      ? seedSproochliText({
          text: description,
          sourceLanguage: nameSeed.sourceLanguage,
          existingText: captured.descriptions,
        })
      : null
    assertScope()
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid)
      throw new Error('The account changed. Reopen the Prep Item editor.')
    const token = await user.getIdToken()
    assertScope()
    const result = await $fetch<{ id: string }>(
      '/api/workspace/kitchen/prep-items',
      {
        onResponse: async ({ options, response }) => {
          if (
            response.ok &&
            !['GET', 'HEAD'].includes(
              String(options.method || 'GET').toUpperCase()
            )
          )
            await refreshNuxtData()
        },
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          kitchenId,
          draft: {
            ...captured,
            name,
            description,
            source_language: nameSeed.sourceLanguage,
            names: nameSeed.text,
            descriptions: descriptionSeed?.text ?? {},
          },
        },
      }
    )
    if (
      typeof result?.id !== 'string' ||
      result.id !== result.id.trim() ||
      !isFirestoreDocumentId(result.id)
    )
      throw new Error('Prep Item response did not identify the created record.')
    return { id: result.id }
  }
  return { createPrepItem }
}
