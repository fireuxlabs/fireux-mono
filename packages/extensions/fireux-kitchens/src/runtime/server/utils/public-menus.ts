import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind.ts'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { UserStorage } from 'fireux-core/runtime/models/core/user.model.ts'
import {
  kitchenPublicMenuPath,
  kitchenPublicMenuRouteMode,
} from '../../utils/kitchen-public-menu-route.ts'

type PublicMenuScope = {
  kitchenId?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  sourceKind?: string
  viewLabel?: string
  viewTo?: string
  path?: string
  qrPath?: string
  createdByLabel?: string
  page_style?: Record<string, unknown>
  sections?: unknown[]
}

type PublicMenuFile = {
  url?: string
  name?: string
  type?: string
  storage_path?: string
}

type PublicMenuSource = {
  app_id?: string
  kitchen_id?: string
  kitchen_slug?: string
  kitchen_name?: string
  menu_id?: string
}

const menuSlug = (data: Record<string, unknown>, docId: string) =>
  readRecordString(data, 'slug') || docId

const publicMenuPath = (slug: string) => `/menus/${encodeURIComponent(slug)}`

const text = (value: unknown) => String(value ?? '').trim()
const origin = (value: unknown) => text(value).replace(/\/+$/, '')

const publicMenuFileKind = (options: {
  docName: string
  docType: string
  storedKind: string
}) => {
  return documentKindFromFile({
    fileName: options.docName,
    contentType: options.docType,
    storedKind: options.storedKind,
  })
}

const defaultViewLabel = (kind: string) => {
  if (kind === 'menu') return 'View menu'
  if (kind === 'doc') return 'View file'

  return 'View menu'
}

const readMenuSourceKind = (data: Record<string, unknown>) =>
  readRecordString(data, 'source_kind') ||
  readRecordString(data, 'kind')

const readMenuDocumentKind = (data: Record<string, unknown>) =>
  readRecordString(data, 'file_kind') ||
  readRecordString(data, 'doc_kind') ||
  readRecordString(data, 'kind')

const readMenuFile = (data: Record<string, unknown>): PublicMenuFile => {
  const file = readRecord(data.file)

  return {
    url: readRecordString(file, 'url') || readRecordString(data, 'file_url') || readRecordString(data, 'doc_url'),
    name: readRecordString(file, 'name') || readRecordString(data, 'file_name') || readRecordString(data, 'doc_name'),
    type: readRecordString(file, 'type') || readRecordString(data, 'file_type') || readRecordString(data, 'doc_type'),
    storage_path:
      readRecordString(file, 'storage_path') ||
      readRecordString(data, 'file_storage_path') ||
      readRecordString(data, 'doc_storage_path'),
  }
}

const hasFile = (file: PublicMenuFile) =>
  Boolean(file.url || file.name || file.type || file.storage_path)

const compactFile = (file: PublicMenuFile) =>
  Object.fromEntries(
    Object.entries(file).filter(([, value]) => Boolean(text(value)))
  ) as PublicMenuFile

const compactSource = (source: PublicMenuSource) =>
  Object.fromEntries(
    Object.entries(source).filter(([, value]) => Boolean(text(value)))
  ) as PublicMenuSource

export function publicMenuSourceFromData(
  data: Record<string, unknown>,
  scope: PublicMenuScope = {}
) {
  const source = readRecord(data.source)

  return compactSource({
    app_id:
      scope.kitchenAppId ||
      readRecordString(source, 'app_id') ||
      readRecordString(data, 'kitchen_app_id'),
    kitchen_id:
      scope.kitchenId ||
      readRecordString(source, 'kitchen_id') ||
      readRecordString(data, 'kitchen_id'),
    kitchen_slug:
      scope.kitchenSlug ||
      readRecordString(source, 'kitchen_slug') ||
      readRecordString(data, 'kitchen_slug'),
    kitchen_name:
      scope.kitchenName ||
      readRecordString(source, 'kitchen_name') ||
      readRecordString(data, 'kitchen_name'),
    menu_id:
      scope.kitchenMenuId ||
      readRecordString(source, 'menu_id') ||
      readRecordString(data, 'kitchen_menu_id'),
  })
}

function appPublicOrigin(appData: Record<string, unknown>) {
  const links = appData.social_links
  const socialLinks = links && typeof links === 'object' && !Array.isArray(links)
    ? links as Record<string, unknown>
    : {}

  return origin(socialLinks.website) || origin(appData.source_url)
}

const uniqueText = (values: unknown[]) =>
  Array.from(new Set(values.map((value) => text(value)).filter(Boolean)))

const userDisplayLabel = (data: Record<string, unknown>) =>
  readRecordString(data, 'display_name') ||
  readRecordString(data, 'displayName') ||
  readRecordString(data, 'handle')

export async function readPublicMenuCreatorLabels(createdByIds: string[]) {
  const ids = uniqueText(createdByIds)
  if (!ids.length) return new Map<string, string>()

  const db = getRuntimeIdentityFirestore()
  const entries = await Promise.all(
    ids.map(async (id) => {
      const snap = await db.collection(UserStorage.rootCollection).doc(id).get()
      const label = snap.exists ? userDisplayLabel(snap.data() || {}) : ''

      return [id, label || 'User'] as const
    })
  )

  return new Map(entries)
}

export function publicMenuCreatorLabel(
  createdBy: string,
  creatorLabels: Map<string, string>
) {
  if (!createdBy) return 'Guest'

  return creatorLabels.get(createdBy) || 'User'
}

export function publicMenuOwnerAppView(options: {
  ownerAppId: string
  currentAppId: string
  ownerAppData: Record<string, unknown>
  ownerAppKitchenCount: number
  kitchenSlug: string
  menuId: string
}) {
  if (!options.ownerAppId || options.ownerAppId === options.currentAppId) {
    return {}
  }

  const publicOrigin = appPublicOrigin(options.ownerAppData)
  const path = kitchenPublicMenuPath({
    mode: kitchenPublicMenuRouteMode(options.ownerAppKitchenCount),
    kitchenSlug: options.kitchenSlug,
    menuId: options.menuId,
  })

  if (!publicOrigin || !path) return {}

  return {
    viewLabel: 'View app',
    viewTo: new URL(path, publicOrigin).toString(),
    apiTo: new URL(`/api/menus/${encodeURIComponent(options.menuId)}`, publicOrigin).toString(),
  }
}

const valueText = (value: unknown) => String(value ?? '').trim()

const fallbackId = (
  value: unknown,
  fallback: string
) => normalizeSlug(valueText(value)) || fallback

const priceNumber = (value: unknown) => {
  const match = valueText(value).replace(',', '.').match(/\d+(\.\d+)?/)
  const parsed = Number(match?.[0] || 0)

  return Number.isFinite(parsed) ? parsed : 0
}

const publicMenuPayloadSections = (payload: Record<string, unknown>) => {
  const sections = Array.isArray(payload.sections) ? payload.sections : []

  return sections.map((section, sectionIndex) => {
    const sectionRecord = readRecord(section)
    const label = valueText(sectionRecord.label || sectionRecord.name)
    const sectionId = fallbackId(
      sectionRecord.id || label,
      `section-${sectionIndex + 1}`
    )
    const items = Array.isArray(sectionRecord.items) ? sectionRecord.items : []

    return {
      id: sectionId,
      section: {
        id: sectionId,
        label,
        description: valueText(sectionRecord.description),
      },
      label,
      description: valueText(sectionRecord.description),
      items: items.map((item, itemIndex) => {
        const itemRecord = readRecord(item)
        const name = valueText(itemRecord.name)
        const itemId = fallbackId(
          itemRecord.id || name,
          `${sectionId}-item-${itemIndex + 1}`
        )
        const priceLabel = valueText(itemRecord.price_label || itemRecord.price)

        return {
          id: itemId,
          item: {
            id: itemId,
            name,
            description: valueText(itemRecord.description),
          },
          dish: null,
          name,
          description: valueText(itemRecord.description),
          price: priceNumber(itemRecord.price),
          ...(priceLabel ? { priceLabel } : {}),
          priceOptions: [],
        }
      }),
    }
  })
}

export async function publicMenuPayloadFromApi(apiTo: string) {
  if (!apiTo) return {}

  try {
    const response = await fetch(apiTo, {
      headers: {
        accept: 'application/json',
      },
    })

    if (!response.ok) return {}

    const payload = readRecord(await response.json())
    const pageStyle = readRecord(payload.page_style)
    const sections = publicMenuPayloadSections(payload)

    return {
      ...(Object.keys(pageStyle).length ? { page_style: pageStyle } : {}),
      ...(sections.length ? { sections } : {}),
    }
  } catch {
    return {}
  }
}

export function publicMenuFromData(
  menuId: string,
  data: Record<string, unknown>,
  scope: PublicMenuScope = {}
) {
  const slug = menuSlug(data, menuId)
  const path = scope.path || readRecordString(data, 'path') || publicMenuPath(slug)
  const file = readMenuFile(data)
  const sourceKind = scope.sourceKind ?? readMenuSourceKind(data)
  const kind = sourceKind === 'kitchen-menu' || sourceKind === 'menu'
    ? 'menu'
    : 'doc'
  const fileKind = publicMenuFileKind({
    docName: file.name || '',
    docType: file.type || '',
    storedKind: readMenuDocumentKind(data),
  })
  const source = publicMenuSourceFromData(data, scope)
  const createdBy = readRecordString(data, 'created_by')
  const createdByLabel =
    scope.createdByLabel ?? readRecordString(data, 'created_by_label')
  const description = readRecordString(data, 'description')
  const status = readRecordString(data, 'status')
  const pageStyle = readRecord(scope.page_style)
  const result = {
    id: menuId,
    slug,
    name: readRecordString(data, 'name') || slug,
    path,
    qr_path: scope.qrPath || readRecordString(data, 'qr_path') || `${path}/qr`,
    kind,
    view_label: scope.viewLabel || defaultViewLabel(kind),
    view_to: scope.viewTo || path,
    ...(description ? { description } : {}),
    ...(status ? { status } : {}),
    ...(kind === 'doc' ? { file_kind: fileKind } : {}),
    ...(kind === 'doc' && hasFile(file) ? { file: compactFile(file) } : {}),
    ...(kind === 'menu' && Object.keys(source).length ? { source } : {}),
    ...(kind === 'menu' && Array.isArray(scope.sections) && scope.sections.length
      ? { sections: scope.sections }
      : {}),
    ...(kind === 'menu' && Object.keys(pageStyle).length
      ? { page_style: pageStyle }
      : {}),
    ...(createdBy ? { created_by: createdBy } : {}),
    ...(createdByLabel ? { created_by_label: createdByLabel } : {}),
  }

  return result
}
