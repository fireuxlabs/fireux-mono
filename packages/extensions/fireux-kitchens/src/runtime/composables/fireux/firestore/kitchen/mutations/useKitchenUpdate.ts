// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: let an empty Kitchen display override delete itself and inherit Place identity.
import { collection, deleteField, getDocs, query, where } from 'firebase/firestore'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { validatePublicSlug as validateSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { normalizeHexColor } from 'fireux-core/runtime/utils/brand-palette'
import { computed, unref, type Ref } from 'vue'
import { KitchenStorage, type Kitchen, type KitchenUpdateInput } from '../../../../../models/kitchen.model'

type MaybeRef<T> = T | Ref<T>
type UseKitchenUpdateOptions = {
  collectionPath?: MaybeRef<string | null | undefined>
  databaseId?: MaybeRef<string | null | undefined>
}

const COLLECTION_PATH = KitchenStorage.rootCollection

const clean = (value: unknown) => String(value ?? '').trim()
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const hasOwn = (source: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(source, key)

function compactRecord(source: unknown): Record<string, unknown> {
  if (!isRecord(source)) return {}

  return Object.fromEntries(
    Object.entries(source)
      .map(([key, value]) => {
        if (typeof value === 'string') return [key, value.trim()]
        if (Array.isArray(value)) {
          const items = value
            .map((item) => typeof item === 'string' ? item.trim() : item)
            .filter((item) => item !== '' && item !== null && item !== undefined)
          return [key, items]
        }
        if (isRecord(value)) return [key, compactRecord(value)]
        return [key, value]
      })
      .filter(([, value]) => {
        if (typeof value === 'string') return Boolean(value)
        if (Array.isArray(value)) return value.length > 0
        if (isRecord(value)) return Object.keys(value).length > 0
        return value !== null && value !== undefined
      })
  )
}

function normalizeKitchenUpdatePatch(patch: KitchenUpdateInput) {
  const source = patch as Record<string, unknown>
  const next = { ...source }
  const unsupportedStoredFields = [
    'display_name',
    'name',
    'tagline',
    'display_image_url',
    'image_url',
    'card_image_url',
    'logo_image_url',
    'wordmark_no_logo_image_url',
    'wordmark_image_url',
    'cover_image',
    'image_shade',
    'food_gallery',
    'currency_format',
    'menu_currency_format',
    'show_currency',
    'menu_show_currency',
    'menu_available',
    'menu_style',
    'style',
    'show',
    'active',
    'is_test_kitchen',
    'app_scope_state',
    'app_scope_app_id',
    'app_id',
    'app_scope',
    'identity.image_url',
    'identity.gallery',
  ]
  const unsupported = unsupportedStoredFields.find(key => hasOwn(source, key))
  if (unsupported) {
    throw new Error(
      `Kitchen update contains non-canonical field "${unsupported}".`
    )
  }

  const moveString = (
    from: string,
    to: string
  ) => {
    if (!hasOwn(source, from)) return
    const value = clean(source[from])
    if (from !== to) next[from] = deleteField()
    next[to] = value || deleteField()
  }

  const moveDefaultString = (
    from: string,
    to: string,
    defaultValue: string
  ) => {
    if (!hasOwn(source, from)) return
    const value = clean(source[from])
    if (from !== to) next[from] = deleteField()
    next[to] = value && value !== defaultValue ? value : deleteField()
  }

  const moveBoolean = (
    from: string,
    to: string,
    defaultValue: boolean
  ) => {
    if (!hasOwn(source, from)) return
    const value = source[from]
    if (typeof value !== 'boolean') return
    if (from !== to) next[from] = deleteField()
    next[to] = value === defaultValue ? deleteField() : value
  }

  const moveStyle = (from: string, to: string) => {
    if (!hasOwn(source, from)) return
    const style = compactRecord(source[from])
    if (from !== to) next[from] = deleteField()
    next[to] = Object.keys(style).length ? style : deleteField()
  }

  const normalizeBackdropColor = (from: string, to: string) => {
    if (!hasOwn(source, from)) return
    const color = normalizeHexColor(source[from])
    if (color === null) {
      throw new Error('Media backdrop must be a 6-digit hex colour.')
    }
    if (from !== to) next[from] = deleteField()
    next[to] = color || deleteField()
  }

  if (isRecord(source.identity)) {
    const identity = source.identity
    if (hasOwn(identity, 'image_url') || hasOwn(identity, 'gallery')) {
      throw new Error('Kitchen media belongs to the linked Place.')
    }
    delete next.identity
    if (hasOwn(identity, 'display_name')) {
      source['identity.display_name'] = identity.display_name
    }
    if (hasOwn(identity, 'tagline')) source['identity.tagline'] = identity.tagline
    if (hasOwn(identity, 'card_image_url')) {
      source['identity.card_image_url'] = identity.card_image_url
    }
    if (hasOwn(identity, 'logo_image_url')) {
      source['identity.logo_image_url'] = identity.logo_image_url
    }
    if (hasOwn(identity, 'wordmark_no_logo_image_url')) {
      source['identity.wordmark_no_logo_image_url'] =
        identity.wordmark_no_logo_image_url
    }
    if (hasOwn(identity, 'wordmark_image_url')) {
      source['identity.wordmark_image_url'] = identity.wordmark_image_url
    }
    if (hasOwn(identity, 'media_backdrop_color')) {
      source['identity.media_backdrop_color'] = identity.media_backdrop_color
    }
  }

  if (isRecord(source.menus)) {
    const menus = source.menus
    delete next.menus
    if (hasOwn(menus, 'currency_format')) {
      source['menus.currency_format'] = menus.currency_format
    }
    if (hasOwn(menus, 'show_currency')) {
      source['menus.show_currency'] = menus.show_currency
    }
    if (hasOwn(menus, 'style')) source['menus.style'] = menus.style
  }

  if (isRecord(source.visibility)) {
    const visibility = source.visibility
    delete next.visibility
    if (hasOwn(visibility, 'show')) source['visibility.show'] = visibility.show
    if (hasOwn(visibility, 'active')) source['visibility.active'] = visibility.active
    if (hasOwn(visibility, 'is_test')) {
      source['visibility.is_test'] = visibility.is_test
    }
  }

  moveString('identity.display_name', 'identity.display_name')
  moveString('identity.tagline', 'identity.tagline')
  moveString('identity.card_image_url', 'identity.card_image_url')
  moveString('identity.logo_image_url', 'identity.logo_image_url')
  moveString(
    'identity.wordmark_no_logo_image_url',
    'identity.wordmark_no_logo_image_url'
  )
  moveString('identity.wordmark_image_url', 'identity.wordmark_image_url')
  normalizeBackdropColor(
    'identity.media_backdrop_color',
    'identity.media_backdrop_color'
  )

  moveDefaultString('menus.currency_format', 'menus.currency_format', 'dash')
  moveBoolean('menus.show_currency', 'menus.show_currency', true)
  moveBoolean('menus.available', 'menus.available', true)
  moveStyle('menus.style', 'menus.style')

  moveBoolean('visibility.show', 'visibility.show', false)
  moveBoolean('visibility.active', 'visibility.active', true)
  moveBoolean('visibility.is_test', 'visibility.is_test', false)

  return next as Partial<Kitchen>
}

const pruneUndefined = (payload: Partial<Kitchen>) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as Partial<Kitchen>

export function useKitchenUpdate(options: UseKitchenUpdateOptions = {}) {
  const collectionPath = computed(() =>
    clean(unref(options.collectionPath)) || COLLECTION_PATH
  )
  const { updateDocument } = useFirestoreUpdate({
    databaseId: options.databaseId,
  })
  const db = useFirestore(options.databaseId)

  const resolveSlugUpdate = async (kitchenId: string, value: unknown) => {
    const validation = validateSlug(value, {
      label: 'Kitchen slug',
      namespace: KitchenStorage.rootCollection,
      reservedScope: 'root',
      maxLength: 80,
    })

    if (!validation.isValid) {
      throw new Error(validation.message || 'Kitchen slug is invalid.')
    }

    const slug = validation.slug
    const slugQuery = query(
      collection(db, COLLECTION_PATH),
      where('slug', '==', slug)
    )
    const snapshot = await getDocs(slugQuery)
    const conflict = snapshot.docs.find((docSnap) => docSnap.id !== kitchenId)

    if (conflict) {
      throw new Error(`Kitchen slug "${slug}" is already taken.`)
    }

    return slug
  }

  const updateKitchen = async (kitchenId: string, patch: KitchenUpdateInput) => {
    const id = clean(kitchenId)
    if (!id) throw new Error('Kitchen id is required')

    const nextPatch = { ...patch }
    const hasSlugPatch = Object.prototype.hasOwnProperty.call(patch, 'slug')

    if (hasSlugPatch) {
      nextPatch.slug = await resolveSlugUpdate(id, patch.slug)
      const aliasPrunePatch = nextPatch as Record<string, unknown>
      aliasPrunePatch.slug_aliases = deleteField()
      aliasPrunePatch.slugAliases = deleteField()
    }

    const prunedPatch = pruneUndefined(normalizeKitchenUpdatePatch(nextPatch))

    await updateDocument<Kitchen>(
      collectionPath.value,
      id,
      prunedPatch
    )

  }

  return { updateKitchen }
}
