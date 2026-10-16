import {
  normalizeSproochliLanguage,
  type SproochliDefaultLanguage,
  type SproochliLanguageCode,
  type SproochliMenuTranslationField,
} from 'fireux-sproochli/runtime/sproochli'
import { resolveSproochliMenu } from 'fireux-sproochli/runtime/server/menu/provider-client'
import {
  readSproochliMenuTranslationCache,
  readSproochliMenuTranslationCacheLanguages,
  writeSproochliMenuTranslationCache,
} from 'fireux-sproochli/runtime/server/menu/translation-cache'
import {
  readSproochliTranslationMemory,
  sproochliTranslationMemoryId,
  writeSproochliTranslationMemory,
} from 'fireux-sproochli/runtime/server/menu/translation-memory'
import { sproochliMenuTranslationMemoryCandidate } from 'fireux-sproochli/runtime/server/menu/translation-recipe'
import { resolveSproochliHostStorage } from 'fireux-sproochli/runtime/server/menu/storage'
import {
  MENU_BROWSE_SURFACE_COPY_FIELDS,
  resolveMenuBrowseSurfaceCopy,
} from '../../utils/menu-surface-copy'
import type { MenuManifest } from '../../models/menu-detail.model.ts'

const text = (value: unknown) => String(value ?? '').trim()
const readCanonicalCacheLanguages = async (
  input: Parameters<typeof readSproochliMenuTranslationCacheLanguages>[0]
): Promise<SproochliLanguageCode[]> => [
  ...new Set(
    (await readSproochliMenuTranslationCacheLanguages(input))
      .map(normalizeSproochliLanguage)
      .filter((entry): entry is Exclude<SproochliLanguageCode, ''> =>
        Boolean(entry)
      )
  ),
]
const fieldSegment = (value: unknown) =>
  text(value).replace(/[^A-Za-z0-9_-]+/g, '-') || 'unknown'
const menuFieldKey = (menu: MenuManifest) =>
  `menu:${fieldSegment(menu.content.id)}`
const dishFieldKey = (sectionId: string, itemId: string) =>
  `dish:${fieldSegment(sectionId)}__${fieldSegment(itemId)}`

function menuFields(menu: MenuManifest): SproochliMenuTranslationField[] {
  const menuKey = menuFieldKey(menu)
  const fields: SproochliMenuTranslationField[] = [
    { id: `${menuKey}:name`, sourceText: text(menu.content.name) },
    {
      id: `${menuKey}:description`,
      sourceText: text(menu.content.description),
    },
  ]

  menu.content.sections.forEach((section) => {
    fields.push({
      id: `section:${section.id}:label`,
      sourceText: text(section.label),
    })
    section.items.forEach((item) => {
      const itemKey = dishFieldKey(section.id, item.id)
      fields.push(
        { id: `${itemKey}:name`, sourceText: text(item.name) },
        { id: `${itemKey}:description`, sourceText: text(item.description) }
      )
      item.mealDeal?.groups.forEach((group) => {
        fields.push({
          id: `${itemKey}:group:${group.id}:name`,
          sourceText: text(group.name),
        })
        group.dishes.forEach((choice) =>
          fields.push({
            id: `${itemKey}:group:${group.id}:dish:${choice.dishId}:name`,
            sourceText: text(choice.name),
          })
        )
      })
      item.priceOptions.forEach((option) => {
        fields.push({
          id: `${itemKey}:price-option:${option.id}:label`,
          sourceText: text(option.label),
        })
      })
      item.addOns.forEach((option) => {
        fields.push({
          id: `${itemKey}:add-on:${option.id}:label`,
          sourceText: text(option.label),
        })
      })
    })
  })

  return fields.filter((field) => field.sourceText)
}

function translatedMenu(
  menu: MenuManifest,
  translations: ReadonlyMap<string, string>
): MenuManifest {
  const translated = (id: string, fallback: string) =>
    text(translations.get(id)) || fallback
  const menuKey = menuFieldKey(menu)

  return {
    ...menu,
    content: {
      ...menu.content,
      name: translated(`${menuKey}:name`, menu.content.name),
      description: translated(
        `${menuKey}:description`,
        menu.content.description
      ),
      sections: menu.content.sections.map((section) => ({
        ...section,
        label: translated(`section:${section.id}:label`, section.label),
        items: section.items.map((item) => {
          const itemKey = dishFieldKey(section.id, item.id)
          return {
            ...item,
            name: translated(`${itemKey}:name`, item.name),
            description: translated(`${itemKey}:description`, item.description),
            ...(item.mealDeal
              ? {
                  mealDeal: {
                    ...item.mealDeal,
                    groups: item.mealDeal.groups.map((group) => ({
                      ...group,
                      name: translated(
                        `${itemKey}:group:${group.id}:name`,
                        group.name
                      ),
                      dishes: group.dishes.map((choice) => ({
                        ...choice,
                        name: translated(
                          `${itemKey}:group:${group.id}:dish:${choice.dishId}:name`,
                          choice.name
                        ),
                      })),
                    })),
                  },
                }
              : {}),
            priceOptions: item.priceOptions.map((option) => ({
              ...option,
              label: translated(
                `${itemKey}:price-option:${option.id}:label`,
                option.label
              ),
            })),
            addOns: item.addOns.map((option) => ({
              ...option,
              label: translated(
                `${itemKey}:add-on:${option.id}:label`,
                option.label
              ),
            })),
          }
        }),
      })),
    },
  }
}

export async function resolveMenuSproochli(
  menu: MenuManifest,
  requestedLanguage: SproochliLanguageCode,
  defaultLanguage: SproochliDefaultLanguage = 'mixed'
): Promise<MenuManifest> {
  const defaultSurfaceCopy = resolveMenuBrowseSurfaceCopy(
    null,
    defaultLanguage === 'mixed' ? '' : defaultLanguage
  )
  const fields = [
    ...menuFields(menu),
    ...MENU_BROWSE_SURFACE_COPY_FIELDS.map((field) => ({
      id: field.id,
      sourceText: field.sourceText,
    })),
  ]
  const storage = resolveSproochliHostStorage()
  const cacheScope = {
    storage,
    source: menu.source,
    fields,
  }
  let readyLanguages: SproochliLanguageCode[] | null = null

  try {
    readyLanguages = await readCanonicalCacheLanguages(cacheScope)
    if (!requestedLanguage) {
      return {
        ...menu,
        sproochli: {
          state: 'default',
          language: '',
          defaultLanguage,
          readyLanguages,
          surfaceCopy: defaultSurfaceCopy,
        },
      }
    }

    let translations = await readSproochliMenuTranslationCache({
      ...cacheScope,
      targetLanguage: requestedLanguage,
    })

    if (!translations) {
      const candidates = fields.map((field) =>
        sproochliMenuTranslationMemoryCandidate({
          fieldId: field.id,
          sourceLanguage: 'auto',
          sourceText: field.sourceText,
          targetLanguage: requestedLanguage,
        })
      )
      const memory = await readSproochliTranslationMemory(storage, candidates)
      translations = new Map<string, string>()
      const missingFields: SproochliMenuTranslationField[] = []

      candidates.forEach((candidate, index) => {
        const hit = memory.get(sproochliTranslationMemoryId(candidate))
        if (hit?.text) {
          translations!.set(candidate.fieldId, hit.text)
        } else {
          missingFields.push(fields[index]!)
        }
      })

      if (missingFields.length) {
        const resolution = await resolveSproochliMenu({
          host: storage.target,
          source: menu.source,
          fields: missingFields,
          language: requestedLanguage,
        })
        const resolved = new Map(Object.entries(resolution.translations))
        const sameHost =
          resolution.host.appId === storage.target.appId &&
          resolution.host.firebaseProjectId ===
            storage.target.firebaseProjectId &&
          resolution.host.databaseId === storage.target.databaseId
        if (
          !sameHost ||
          resolution.language !== requestedLanguage ||
          resolved.size !== missingFields.length ||
          missingFields.some((field) => !text(resolved.get(field.id)))
        ) {
          throw new Error('Sproochli returned an incomplete Menu.')
        }

        missingFields.forEach((field) => {
          translations!.set(field.id, text(resolved.get(field.id)))
        })
        const missingIds = new Set(missingFields.map((field) => field.id))
        await writeSproochliTranslationMemory(
          storage,
          candidates
            .filter((candidate) => missingIds.has(candidate.fieldId))
            .map((candidate) => ({
              ...candidate,
              provider: text(resolution.provider) || 'google-cloud-translation',
              translatedText: translations!.get(candidate.fieldId) || '',
            }))
        )
      }

      if (
        translations.size !== fields.length ||
        fields.some((field) => !text(translations!.get(field.id)))
      ) {
        throw new Error('Sproochli could not resolve a complete Menu.')
      }
      await writeSproochliMenuTranslationCache({
        cache: {
          ...cacheScope,
          targetLanguage: requestedLanguage,
        },
        translations,
      })
      translations = await readSproochliMenuTranslationCache({
        ...cacheScope,
        targetLanguage: requestedLanguage,
      })
      if (!translations) {
        throw new Error('Sproochli could not persist a complete Menu.')
      }
      readyLanguages = await readCanonicalCacheLanguages(cacheScope)
    }

    const translated = translatedMenu(menu, translations)
    return {
      ...translated,
      sproochli: {
        state: 'translated',
        language: requestedLanguage,
        defaultLanguage,
        readyLanguages,
        surfaceCopy: resolveMenuBrowseSurfaceCopy(translations),
      },
    }
  } catch {
    return {
      ...menu,
      sproochli: {
        state: requestedLanguage ? 'unavailable' : 'default',
        language: requestedLanguage,
        defaultLanguage,
        readyLanguages,
        surfaceCopy: defaultSurfaceCopy,
      },
    }
  }
}
