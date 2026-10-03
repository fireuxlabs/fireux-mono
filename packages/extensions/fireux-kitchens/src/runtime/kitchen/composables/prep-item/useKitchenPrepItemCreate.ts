import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useTranslationSeed } from 'fireux-translation/runtime/useTranslationSeed'
import { useKitchenWorkspaceSelection } from '../workspace/useKitchenWorkspaceSelection'
import type { KitchenPrepItemInput, KitchenPrepItemUnit } from '../../utils/prep-item'

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
  languageCodes?: string[]
  sourceLanguage?: string
  translate?: boolean
}

export function useKitchenPrepItemCreate() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { currentUser } = useAuth()
  const { selectedId } = useKitchenWorkspaceSelection()
  const route = useRoute()
  const { seedTranslations } = useTranslationSeed()
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const captureIntent = useCommandScope([selectedId, () => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value), () => route.fullPath])
  const createPrepItem = async (draft: KitchenPrepItemCreateDraft, overrides: { kitchenId?: string } = {}, createOptions: KitchenPrepItemCreateOptions = {}) => {
    requireWritableData()
    const kitchenId = String(overrides.kitchenId || selectedId.value || '').trim()
    if (!kitchenId) throw new Error('Kitchen id is required')
    const captured = JSON.parse(JSON.stringify(draft)) as KitchenPrepItemCreateDraft
    const options = JSON.parse(JSON.stringify(createOptions)) as KitchenPrepItemCreateOptions
    const isCurrent = captureIntent(), uid = currentUser.value?.uid
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || !isCurrent())
        throw new Error('The account or Kitchen changed. Reopen the Prep Item editor.')
    }
    const name = String(captured.name ?? '').trim(), description = String(captured.description ?? '').trim()
    const nameSeed = await seedTranslations({ text: name, sourceLanguage: options.sourceLanguage, languageCodes: options.languageCodes, existingText: captured.names, translate: options.translate })
    assertScope()
    const descriptionSeed = description ? await seedTranslations({ text: description, sourceLanguage: nameSeed.sourceLanguage, languageCodes: options.languageCodes, existingText: captured.descriptions, translate: options.translate }) : null
    assertScope()
    const user = await useRequireUser()
    assertScope()
    if (user.uid !== uid) throw new Error('The account changed. Reopen the Prep Item editor.')
    const token = await user.getIdToken()
    assertScope()
    requireWritableData()
    const result = await $fetch<{ id: string }>('/api/workspace/kitchen/prep-items', {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
      body: { kitchenId, draft: { ...captured, name, description, source_language: nameSeed.sourceLanguage, names: nameSeed.text, descriptions: descriptionSeed?.text ?? {} } },
    })
    if (!result?.id) throw new Error('Prep Item response did not identify the created record.')
    return { id: result.id, failedLanguages: [...new Set([...nameSeed.failedLanguages, ...(descriptionSeed?.failedLanguages ?? [])])] }
  }
  return { createPrepItem }
}
