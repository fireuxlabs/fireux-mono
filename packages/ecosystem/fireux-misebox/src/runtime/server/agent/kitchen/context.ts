import { UserStorage } from 'fireux-core/runtime/models/core/user.model'
import { UserContextStorage } from 'fireux-core/runtime/models/operations/user-context.model'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { readKitchenMenuSections } from 'fireux-kitchens/runtime/server/menu/manifest/sections'
import { readKitchenMenusConfig } from 'fireux-kitchens/runtime/utils/kitchen-spine'
import type { KitchenAgentAccess, KitchenAgentRequest } from './types'

const MAX_MENUS = 12
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

async function readUserContext(uid: string) {
  const snapshot = await getRuntimeIdentityFirestore()
    .collection(UserStorage.collection)
    .doc(uid)
    .collection(UserContextStorage.collection)
    .doc(UserContextStorage.document)
    .get()
  return snapshot.exists
    ? readRecordString(snapshot.data() || {}, 'context')
    : ''
}

async function readMenuManifest(
  access: KitchenAgentAccess,
  request: KitchenAgentRequest
) {
  const snapshot = await access.db
    .collection(`apps/${request.appId}/kitchens/${request.kitchenId}/menus`)
    .limit(MAX_MENUS)
    .get()
  return Promise.all(
    snapshot.docs.map(async (document) => {
      const data = document.data() || {}
      const sections = await readKitchenMenuSections(access.db, {
        appId: request.appId,
        kitchenId: request.kitchenId,
        menuId: document.id,
      })
      return {
        id: document.id,
        name: readRecordString(data, 'name') || document.id,
        status: readRecordString(data, 'status'),
        section_count: sections.length,
        item_count: sections.reduce(
          (total, section) => total + section.items.length,
          0
        ),
        sections: sections.map((section) => ({
          label: section.label,
          item_count: section.items.length,
        })),
      }
    })
  )
}

export async function readKitchenAgentContext(
  access: KitchenAgentAccess,
  request: KitchenAgentRequest
) {
  const [userContext, menuManifest] = await Promise.all([
    readUserContext(access.uid),
    readMenuManifest(access, request),
  ])
  const identity = record(access.rootKitchen.identity)
  return {
    kitchenName: readRecordString(identity, 'name') || request.kitchenId,
    tagline: readRecordString(identity, 'tagline'),
    userContext,
    kitchenContext: readRecordString(
      record(access.appKitchen.console),
      'context'
    ),
    menuContext: readKitchenMenusConfig(access.appKitchen).context,
    menuManifest,
  }
}
