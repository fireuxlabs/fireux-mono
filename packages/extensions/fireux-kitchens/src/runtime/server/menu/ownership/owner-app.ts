import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

const text = (value: unknown) => String(value ?? '').trim()
const origin = (value: unknown) => text(value).replace(/\/+$/, '')

function ownerAppOrigin(appData: Record<string, unknown>) {
  const socialLinks = readRecord(appData.social_links)

  return origin(readRecordString(socialLinks, 'website')) ||
    origin(readRecordString(appData, 'source_url'))
}

export function menuOwnerAppView(options: {
  ownerAppId: string
  currentAppId: string
  ownerAppData: Record<string, unknown>
  menuId: string
}) {
  if (!options.ownerAppId || options.ownerAppId === options.currentAppId) {
    return {}
  }

  const appOrigin = ownerAppOrigin(options.ownerAppData)
  if (!appOrigin || !options.menuId) return {}

  return {
    apiTo: new URL(`/api/menus/${encodeURIComponent(options.menuId)}`, appOrigin).toString(),
  }
}

export function menuOwnerAppApiTo(view: unknown) {
  return view && typeof view === 'object' && 'apiTo' in view
    ? text((view as Record<string, unknown>).apiTo)
    : ''
}

export async function readMenuOwnerAppView(options: {
  ownerAppId: string
  currentAppId: string
  kitchenSlug: string
  menuId: string
}) {
  if (!options.ownerAppId || !options.menuId) {
    return {}
  }

  const db = getRuntimeFirestore()
  const appSnap = await db.collection('apps').doc(options.ownerAppId).get()

  return menuOwnerAppView({
    ownerAppId: options.ownerAppId,
    currentAppId: options.currentAppId,
    ownerAppData: appSnap.exists ? appSnap.data() || {} : {},
    menuId: options.menuId,
  })
}
