import { collection, deleteField, getDocs, query, where } from 'firebase/firestore'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { validatePublicSlug as validateSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { computed, unref, type Ref } from 'vue'
import { KitchenStorage, type Kitchen, type KitchenUpdateInput } from '../../../../../models/kitchen.model'
import { MenuStorage } from '../../../../../models/kitchen/menu/menu.model'
import {
  menuRootEntryPatchFromKitchen,
  readMenuRootEntryDocs,
} from '../../menu/utils/root-entry'

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

  const moveString = (
    from: string,
    to: string,
    options: { required?: boolean } = {}
  ) => {
    if (!hasOwn(source, from)) return
    const value = clean(source[from])
    if (options.required && !value) {
      throw new Error('Kitchen display name is required.')
    }
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

  const moveStringArray = (from: string, to: string) => {
    if (!hasOwn(source, from)) return
    const values = Array.isArray(source[from])
      ? (source[from] as unknown[]).map(clean).filter(Boolean)
      : []
    if (from !== to) next[from] = deleteField()
    next[to] = values.length ? values : deleteField()
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

  const normalizeImageShade = (from: string, to: string) => {
    if (!hasOwn(source, from)) return
    const shade = clean(source[from])
    if (from !== to) next[from] = deleteField()
    next[to] = shade === 'light' || shade === 'dark' ? shade : deleteField()
  }

  if (isRecord(source.identity)) {
    const identity = source.identity
    delete next.identity
    if (hasOwn(identity, 'display_name')) {
      source['identity.display_name'] = identity.display_name
    }
    if (hasOwn(identity, 'tagline')) source['identity.tagline'] = identity.tagline
    if (hasOwn(identity, 'image_url')) source['identity.image_url'] = identity.image_url
    if (hasOwn(identity, 'wordmark_no_logo_image_url')) {
      source['identity.wordmark_no_logo_image_url'] =
        identity.wordmark_no_logo_image_url
    }
    if (hasOwn(identity, 'wordmark_image_url')) {
      source['identity.wordmark_image_url'] = identity.wordmark_image_url
    }
    if (hasOwn(identity, 'image_shade')) {
      source['identity.image_shade'] = identity.image_shade
    }
    if (hasOwn(identity, 'gallery')) source['identity.gallery'] = identity.gallery
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

  if (isRecord(source.app_scope)) {
    const appScope = source.app_scope
    delete next.app_scope
    if (hasOwn(appScope, 'state')) source['app_scope.state'] = appScope.state
    if (hasOwn(appScope, 'app_id')) source['app_scope.app_id'] = appScope.app_id
  }

  moveString('display_name', 'identity.display_name', { required: true })
  moveString('name', 'identity.display_name', { required: true })
  moveString('identity.display_name', 'identity.display_name', { required: true })
  moveString('tagline', 'identity.tagline')
  moveString('identity.tagline', 'identity.tagline')
  moveString('display_image_url', 'identity.image_url')
  moveString('image_url', 'identity.image_url')
  moveString('identity.image_url', 'identity.image_url')
  moveString('wordmark_no_logo_image_url', 'identity.wordmark_no_logo_image_url')
  moveString(
    'identity.wordmark_no_logo_image_url',
    'identity.wordmark_no_logo_image_url'
  )
  moveString('wordmark_image_url', 'identity.wordmark_image_url')
  moveString('identity.wordmark_image_url', 'identity.wordmark_image_url')
  moveString('cover_image', 'cover_image')
  normalizeImageShade('image_shade', 'identity.image_shade')
  normalizeImageShade('identity.image_shade', 'identity.image_shade')
  moveStringArray('food_gallery', 'identity.gallery')
  moveStringArray('identity.gallery', 'identity.gallery')

  moveDefaultString('currency_format', 'menus.currency_format', 'dash')
  moveDefaultString('menu_currency_format', 'menus.currency_format', 'dash')
  moveDefaultString('menus.currency_format', 'menus.currency_format', 'dash')
  moveBoolean('show_currency', 'menus.show_currency', true)
  moveBoolean('menu_show_currency', 'menus.show_currency', true)
  moveBoolean('menus.show_currency', 'menus.show_currency', true)
  moveBoolean('menu_available', 'menus.available', true)
  moveBoolean('menus.available', 'menus.available', true)
  moveStyle('menu_style', 'menus.style')
  moveStyle('style', 'menus.style')
  moveStyle('menus.style', 'menus.style')

  moveBoolean('show', 'visibility.show', false)
  moveBoolean('active', 'visibility.active', true)
  moveBoolean('is_test_kitchen', 'visibility.is_test', false)
  moveBoolean('visibility.show', 'visibility.show', false)
  moveBoolean('visibility.active', 'visibility.active', true)
  moveBoolean('visibility.is_test', 'visibility.is_test', false)

  moveString('app_scope_state', 'app_scope.state')
  moveString('app_scope_app_id', 'app_scope.app_id')
  moveString('app_id', 'app_scope.app_id')
  moveString('app_scope.state', 'app_scope.state')
  moveString('app_scope.app_id', 'app_scope.app_id')

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

    await updateMenuRootEntries(id, prunedPatch)
  }

  const updateMenuRootEntries = async (
    kitchenId: string,
    patch: Partial<Kitchen>
  ) => {
    if (collectionPath.value !== KitchenStorage.rootCollection) return

    const menuPatch = menuRootEntryPatchFromKitchen(patch as Record<string, unknown>)
    if (!Object.keys(menuPatch).length) return

    const rootMenuDocs = await readMenuRootEntryDocs({
      db,
      kitchenId,
    })

    await Promise.all(
      rootMenuDocs.map((docSnap) =>
        updateDocument<Record<string, unknown>>(
          MenuStorage.rootCollection,
          docSnap.id,
          menuPatch
        )
      )
    )
  }

  return { updateKitchen }
}
