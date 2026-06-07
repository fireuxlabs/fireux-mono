import type {
  DocumentReference,
  Firestore,
} from 'firebase-admin/firestore'
import { normalizeSproochliLanguage } from 'fireux-sproochli/runtime/sproochli'

export type KitchenPublicMenuLanguageField = {
  id: string
  sourceLanguage: string
  sourceText: string
}

export type KitchenPublicMenuLanguageSource =
  | {
      ok: true
      kitchen: Record<string, unknown>
      menu: Record<string, unknown>
      appKitchenRef: DocumentReference
      menuRef: DocumentReference
    }
  | {
      ok: false
      reason: 'kitchen' | 'menu'
    }

const text = (value: unknown) => String(value ?? '').trim()
const lower = (value: unknown) => text(value).toLowerCase()
const unique = (values: string[]) => [...new Set(values.map(text).filter(Boolean))]
const isActiveChild = (value: Record<string, unknown>) =>
  text(value.status) !== 'archived'

function sourceLanguageFor(
  menu: Record<string, unknown>,
  kitchen: Record<string, unknown>
) {
  const settings =
    kitchen.language_settings &&
    typeof kitchen.language_settings === 'object' &&
    !Array.isArray(kitchen.language_settings)
      ? kitchen.language_settings as Record<string, unknown>
      : {}

  return (
    normalizeSproochliLanguage(menu.source_language) ||
    normalizeSproochliLanguage(settings.default_language) ||
    'en'
  )
}

function languageField(
  id: string,
  sourceLanguage: string,
  sourceText: unknown
): KitchenPublicMenuLanguageField | null {
  const normalizedId = text(id)
  const normalizedText = text(sourceText)
  if (!normalizedId || !normalizedText) return null

  return {
    id: normalizedId,
    sourceLanguage,
    sourceText: normalizedText,
  }
}

async function findKitchenByPublicKey(db: Firestore, publicKey: string) {
  const rootRef = db.collection('kitchens')
  const bySlug = await rootRef.where('slug', '==', publicKey).limit(1).get()
  if (!bySlug.empty) return bySlug.docs[0]

  const byId = await rootRef.doc(publicKey).get()
  return byId.exists ? byId : null
}

export async function readKitchenPublicMenuLanguageSource(
  db: Firestore,
  input: {
    appId: string
    kitchenSlug: string
    menuId: string
  }
): Promise<KitchenPublicMenuLanguageSource> {
  const kitchenDoc = await findKitchenByPublicKey(db, lower(input.kitchenSlug))
  if (!kitchenDoc) return { ok: false, reason: 'kitchen' }

  const appKitchenRef = db
    .collection('apps')
    .doc(input.appId)
    .collection('kitchens')
    .doc(kitchenDoc.id)
  const appKitchenSnap = await appKitchenRef.get()
  const rootKitchen = kitchenDoc.data() as Record<string, unknown>
  const appKitchen = appKitchenSnap.exists
    ? appKitchenSnap.data() as Record<string, unknown>
    : {}
  const kitchen = { ...rootKitchen, ...appKitchen, id: kitchenDoc.id }
  const menuRef = appKitchenRef.collection('menus').doc(input.menuId)
  const menuSnap = await menuRef.get()

  if (!menuSnap.exists) return { ok: false, reason: 'menu' }

  return {
    ok: true,
    kitchen,
    menu: menuSnap.data() as Record<string, unknown>,
    appKitchenRef,
    menuRef,
  }
}

export async function readKitchenPublicMenuLanguageFields(input: {
  appKitchenRef: DocumentReference
  kitchen: Record<string, unknown>
  menu: Record<string, unknown>
  menuId: string
  menuRef: DocumentReference
  maxFields: number
}) {
  const menuSourceLanguage = sourceLanguageFor(input.menu, input.kitchen)
  const sectionsSnap = await input.menuRef.collection('sections').get()
  const sections = sectionsSnap.docs
    .map((doc) => ({
      id: doc.id,
      ref: doc.ref,
      data: doc.data() as Record<string, unknown>,
    }))
    .filter((entry) => isActiveChild(entry.data))
  const itemSnaps = await Promise.all(
    sections.map((section) => section.ref.collection('items').get())
  )
  const items = itemSnaps
    .flatMap((snap) => snap.docs.map((doc) => doc.data() as Record<string, unknown>))
    .filter(isActiveChild)
  const dishIds = unique(items.map((item) => text(item.dish_id)))
  const dishSnaps = await Promise.all(
    dishIds.map((dishId) => input.appKitchenRef.collection('dishes').doc(dishId).get())
  )
  const dishes = dishSnaps
    .filter((snap) => snap.exists)
    .map((snap) => ({ id: snap.id, data: snap.data() as Record<string, unknown> }))
  const fields = [
    languageField(`menu:${input.menuId}:name`, menuSourceLanguage, input.menu.name),
    languageField(
      `menu:${input.menuId}:description`,
      menuSourceLanguage,
      input.menu.description
    ),
    ...sections.flatMap((section) => [
      languageField(`section:${section.id}:label`, menuSourceLanguage, section.data.label),
      languageField(
        `section:${section.id}:description`,
        menuSourceLanguage,
        section.data.description
      ),
    ]),
    ...dishes.flatMap((dish) => {
      const dishSourceLanguage =
        normalizeSproochliLanguage(dish.data.source_language) || menuSourceLanguage

      return [
        languageField(`dish:${dish.id}:name`, dishSourceLanguage, dish.data.name),
        languageField(
          `dish:${dish.id}:description`,
          dishSourceLanguage,
          dish.data.description
        ),
      ]
    }),
  ]
    .filter((entry): entry is KitchenPublicMenuLanguageField => Boolean(entry))
    .slice(0, input.maxFields)

  return fields
}
