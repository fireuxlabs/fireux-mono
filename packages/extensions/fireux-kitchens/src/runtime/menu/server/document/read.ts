import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import type { MenuDocumentRead } from '../../models/menu-detail.model'
import type { MenuDocument } from '../../models/menu.model'
import { menuDocumentFileIdentity } from '../../utils/records/file-identity'
import {
  readMenuDocumentActor,
  requireMenuDocumentAuthority,
} from './authority'

export function menuDocumentRevision(data: {
  doc?: Partial<MenuDocument>
  status?: unknown
  slug?: unknown
  format?: unknown
  schedule?: unknown
}) {
  return data.doc?.url || data.doc?.storage_path
    ? createHash('sha256').update(menuDocumentFileIdentity(data)).digest('hex')
    : ''
}

export function menuDocumentToolProjection(
  target: Awaited<ReturnType<typeof requireMenuDocumentAuthority>>
): MenuDocumentRead {
  const data = target.menu.data
  const menuPath = `/kitchens/${encodeURIComponent(String(target.kitchen.identity?.slug || ''))}/menus/${encodeURIComponent(String(data.slug || ''))}`
  return {
    kitchenId: target.kitchenId,
    menuId: target.menu.id,
    venue: String(target.place.name || ''),
    name: String(data.name || ''),
    status: data.status as MenuDocumentRead['status'],
    revision: menuDocumentRevision(data),
    acceptsDocument: data.schedule !== 'daily' && !target.hasStructuredContent,
    document:
      data.doc?.url || data.doc?.storage_path
        ? { name: data.doc.name, type: data.doc.type }
        : null,
    menuPath,
    qrPath: `${menuPath}/qr`,
    menus: (target.guest
      ? [target.menu]
      : target.menus.filter((menu) => menu.data.status !== 'archived')
    ).map((menu) => ({
      value: menu.id,
      label: String(menu.data.name || menu.id),
    })),
  }
}

export async function readKitchenDocumentMenu(
  event: H3Event,
  input: { kitchenId: string; menuId?: string; claimSecret?: string }
) {
  const actor = await readMenuDocumentActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) =>
    menuDocumentToolProjection(
      await requireMenuDocumentAuthority(tx, { ...actor, ...input })
    )
  )
}
